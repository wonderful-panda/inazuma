pub mod blame;
pub mod commit;
pub mod commit_detail;
pub mod diff;
pub mod file;
pub mod find_repository_root;
pub mod index;
pub mod js_object_extension;
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

macro_rules! propset {
    ($cx:ident, $obj:ident, { $key:ident: $value:expr }) => {{
        let temp_value = &($value);
        let temp_value = temp_value.to_js_value($cx)?;
        $obj.set($cx, stringify!($key), temp_value)?;
    }};
    ($cx:ident, $obj:ident, { ... $value:expr }) => {{
        let temp_value = &($value);
        temp_value.write($cx, &($obj))?;
    }};
    ($cx:ident, $obj:ident, { $key:ident: $value:expr, $($rest:tt)+ }) => {
        propset!($cx, $obj, { $key: $value });
        propset!($cx, $obj, { $($rest)+ });
    };
    ($cx:ident, $obj:ident, { ...$value:expr, $($rest:tt)+ }) => {{
        propset!($cx, $obj, { ...$value });
        propset!($cx, $obj, { $($rest)+ });
    }};
}

macro_rules! jsobj {
    ($cx:ident, {
        $($key:ident: $value:expr),*
    }) => {
        {
            let temp_obj = JsObject::new($cx);
            propset!($cx, temp_obj, {
                $($key: $value),*
            });
            temp_obj
        }
    };
}

pub trait WriteToJsObject {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()>;
}

pub trait ToJsValue {
    type ValueType: Managed + Value;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType>;
}

impl<T: WriteToJsObject> ToJsValue for T {
    type ValueType = JsObject;
    fn to_js_value<'a, C: Context<'a>>(&self, cx: &mut C) -> JsResult<'a, Self::ValueType> {
        let obj = JsObject::new(cx);
        self.write(cx, &obj)?;
        Ok(obj)
    }
}

// For basic types
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

impl<K: AsRef<str>, T: ToJsValue> WriteToJsObject for HashMap<K, T> {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        for (k, v) in self.iter() {
            let key = cx.string(&k);
            let value = v.to_js_value(cx)?;
            obj.set(cx, key, value)?;
        }
        Ok(())
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
            Some(ref v) => v.to_js_value(cx)?.upcast(),
            None => cx.undefined().upcast(),
        };
        Ok(value)
    }
}

// For composite types
impl WriteToJsObject for Commit {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            id: self.id,
            parentIds: self.parents.split(" ").collect::<Vec<&str>>(),
            author: self.author,
            date: self.author_time,
            summary: self.summary
        });
        Ok(())
    }
}

impl WriteToJsObject for FileLogEntry {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            ...self.commit,
            ...self.stat
        });
        Ok(())
    }
}

impl WriteToJsObject for FileEntry {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            path: self.path,
            oldPath: self.old_path,
            statusCode: self.status_code
        });
        Ok(())
    }
}

impl WriteToJsObject for FileDelta {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        match self {
            FileDelta::Binary => {
                propset!(cx, obj, {
                    type: "binary"
                });
            }
            FileDelta::Text {
                insertions,
                deletions,
            } => {
                propset!(cx, obj, {
                    type: "text",
                    insertions: insertions,
                    deletions: deletions
                });
            }
        }
        Ok(())
    }
}

impl WriteToJsObject for FileStat {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            ...self.file,
            delta: self.delta
        });
        Ok(())
    }
}

impl WriteToJsObject for CommitDetail {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            ...self.commit,
            body: self.body,
            files: self.files
        });
        Ok(())
    }
}

impl WriteToJsObject for BlameEntry {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            id: self.id,
            lineNo: self.line_no
        });
        Ok(())
    }
}

impl WriteToJsObject for BranchRef {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            type: "heads",
            id: self.sha,
            fullname: self.fullname,
            name: self.name,
            current: self.current
        });
        Ok(())
    }
}

impl WriteToJsObject for TagRef {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            type: "tags",
            id: self.sha,
            fullname: self.fullname,
            name: self.name,
            tagId: self.tag_sha
        });
        Ok(())
    }
}

impl WriteToJsObject for RemoteRef {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            type: "remotes",
            id: self.sha,
            fullname: self.fullname,
            name: self.name,
            remote: self.remote
        });
        Ok(())
    }
}

impl WriteToJsObject for Refs {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        propset!(cx, obj, {
            head: self.head,
            mergeHeads: self.merge_heads,
            heads: self.branches,
            tags: self.tags,
            remotes: self.remotes
        });
        Ok(())
    }
}

impl WriteToJsObject for LstreeEntry {
    fn write<'a, C: Context<'a>>(&self, cx: &mut C, obj: &JsObject) -> NeonResult<()> {
        match self {
            LstreeEntry::Tree { path, children } => {
                propset!(cx, obj, {
                    data: jsobj!(cx, {
                        type: "tree",
                        path: path
                    }),
                    children: children
                });
            }
            LstreeEntry::Blob { path } => {
                propset!(cx, obj, {
                    data: jsobj!(cx, {
                        type: "blob",
                        path: path
                    })
                });
            }
        };
        Ok(())
    }
}

pub trait ToJsValueDummy<'a> {
    type ValueType: Managed + Value;
    fn to_js_value<C: Context<'a>>(&self, _: &mut C) -> JsResult<'a, Self::ValueType>;
}

impl<'a, T: Managed + Value> ToJsValueDummy<'a> for Handle<'a, T> {
    type ValueType = T;
    fn to_js_value<C: Context<'a>>(&self, _: &mut C) -> JsResult<'a, Self::ValueType> {
        Ok(*self)
    }
}
