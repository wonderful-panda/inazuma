pub mod blame;
pub mod commit;
pub mod commit_detail;
pub mod file;
pub mod find_repository_root;
pub mod index;
pub mod log;
pub mod lstree;
pub mod refs;
pub mod status;

use neon::handle::Managed;
use neon::prelude::*;
use std::collections::HashMap;
use std::marker::Send;

use crate::git::types::*;
use crate::git::GitError;

fn invoke_callback<R: ToJsValue + Send + 'static>(
    channel: &Channel,
    callback: Root<JsFunction>,
    result: Result<R, GitError>,
) {
    channel.send(move |mut cx| {
        let callback = callback.into_inner(&mut cx);
        let this = cx.undefined();
        let args = match result {
            Ok(value) => vec![
                cx.null().upcast::<JsValue>(),
                value.to_js_value(&mut cx)?.upcast(),
            ],
            Err(e) => vec![cx.error(e.to_string())?.upcast()],
        };
        callback.call(&mut cx, this, args)?;
        Ok(())
    });
}

macro_rules! set_props {
    ($cx:ident, $obj:ident, {
        $($key:ident: $value:expr),*
    }) => {
        {
            $(
                let temp_value = &($value);
                let temp_value = temp_value.to_js_value($cx)?;
                $obj.set($cx, stringify!($key), temp_value)?;
            )*
        }
    };
}

macro_rules! new_obj {
    ($cx:ident, {
        $($key:ident: $value:expr),*
    }) => {
        {
            let temp_obj = JsObject::new($cx);
            set_props!($cx, temp_obj, {
                $($key: $value),*
            });
            temp_obj
        }
    };
}

// For basic types
pub trait ToJsValue {
    type ValueType: Managed + Value;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType>;
}

impl ToJsValue for () {
    type ValueType = JsUndefined;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(cx.undefined())
    }
}

impl ToJsValue for &str {
    type ValueType = JsString;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(cx.string(&self))
    }
}

impl ToJsValue for String {
    type ValueType = JsString;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(cx.string(&self))
    }
}

impl ToJsValue for u32 {
    type ValueType = JsNumber;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(cx.number(*self as f64))
    }
}

impl ToJsValue for u64 {
    type ValueType = JsNumber;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(cx.number(*self as f64))
    }
}

impl ToJsValue for bool {
    type ValueType = JsBoolean;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(cx.boolean(*self))
    }
}

impl<T: ToJsValue> ToJsValue for Vec<T> {
    type ValueType = JsArray;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let ret = JsArray::new(cx, self.len() as u32);
        for i in 0..self.len() {
            let obj = &self[i];
            let js_obj = obj.to_js_value(cx)?;
            ret.set(cx, i as u32, js_obj)?;
        }
        Ok(ret)
    }
}

impl<K: AsRef<str>, T: ToJsValue> ToJsValue for HashMap<K, T> {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let ret = JsObject::new(cx);
        for (k, v) in self.iter() {
            let key = cx.string(&k);
            let value = v.to_js_value(cx)?;
            ret.set(cx, key, value)?;
        }
        Ok(ret)
    }
}

impl ToJsValue for Vec<u8> {
    type ValueType = JsBuffer;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let mut buffer = JsBuffer::new(cx, self.len() as u32)?;
        cx.borrow_mut(&mut buffer, |data| {
            let data = data.as_mut_slice::<u8>();
            data.copy_from_slice(&self)
        });
        Ok(buffer)
    }
}

impl<T: ToJsValue> ToJsValue for Option<T> {
    type ValueType = JsValue;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let value = match self {
            Some(ref v) => v.to_js_value(cx)?.as_value(cx),
            None => cx.undefined().as_value(cx),
        };
        Ok(value)
    }
}

// For composite types
impl ToJsValue for Commit {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let parents: Vec<&str> = self.parents.split(" ").collect();
        let obj = new_obj!(cx, {
            id: self.id,
            parentIds: parents,
            author: self.author,
            date: self.author_time,
            summary: self.summary
        });
        Ok(obj)
    }
}

impl ToJsValue for FileLogEntry {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = self.commit.to_js_value(cx)?;
        set_props!(cx, obj, {
            path: self.path,
            oldPath: self.old_path,
            statusCode: self.status_code
        });
        Ok(obj)
    }
}

impl ToJsValue for FileEntry {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = new_obj!(cx, {
            path: self.path,
            oldPath: self.old_path,
            statusCode: self.status_code
        });
        Ok(obj)
    }
}

impl ToJsValue for FileStat {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = self.file.to_js_value(cx)?;
        match self.delta {
            FileDelta::Binary => {
                set_props!(cx, obj, {
                    insertions: "-",
                    deletions: "-"
                });
            }
            FileDelta::Text {
                insertions,
                deletions,
            } => {
                set_props!(cx, obj, {
                    insertions: insertions,
                    deletions: deletions
                });
            }
        }
        Ok(obj)
    }
}

impl ToJsValue for CommitDetail {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = self.commit.to_js_value(cx)?;
        set_props!(cx, obj, {
            body: self.body,
            files: self.files
        });
        Ok(obj)
    }
}

impl ToJsValue for BlameEntry {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = new_obj!(cx, {
            id: self.id,
            lineNo: self.line_no
        });
        Ok(obj)
    }
}

impl ToJsValue for BranchRef {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = new_obj!(cx, {
            type: "heads",
            id: self.sha,
            fullname: self.fullname,
            name: self.name,
            current: self.current
        });
        Ok(obj)
    }
}

impl ToJsValue for TagRef {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = new_obj!(cx, {
            type: "tags",
            id: self.sha,
            fullname: self.fullname,
            name: self.name,
            tagId: self.tag_sha
        });
        Ok(obj)
    }
}

impl ToJsValue for RemoteRef {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = new_obj!(cx, {
            type: "remotes",
            id: self.sha,
            fullname: self.fullname,
            name: self.name,
            remote: self.remote
        });
        Ok(obj)
    }
}

impl ToJsValue for Refs {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = new_obj!(cx, {
            head: self.head,
            mergeHeads: self.merge_heads,
            heads: self.branches,
            tags: self.tags,
            remotes: self.remotes
        });
        Ok(obj)
    }
}

impl ToJsValue for LstreeEntry {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = JsObject::new(cx);
        let data = JsObject::new(cx);
        match &self {
            LstreeEntry::Tree { path, children } => {
                set_props!(cx, data, {
                    type: "tree",
                    path: path
                });
                set_props!(cx, obj, { children: children });
            }
            LstreeEntry::Blob { path } => {
                set_props!(cx, data, {
                    type: "blob",
                    path: path
                });
            }
        }
        obj.set(cx, "data", data)?;
        Ok(obj)
    }
}
