use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, cached: boolean, callback: (error, ret: FileStat[])) => void;
pub fn get_workingtree_stat_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let cached = cx.argument::<JsBoolean>(1)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::status::get_workingtree_stat(&repo_path, cached);
        invoke_callback(&channel, callback, result)
    });
    Ok(cx.undefined())
}

// (repoPath: string, callback: (error, ret: string[])) => void;
pub fn get_untracked_files_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::status::get_untracked_files(&repo_path);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}

fn get_workingtree_parent(repo_path: &Path) -> Result<Vec<String>, git::GitError> {
    let head = git::rev_parse::rev_parse(&repo_path, "HEAD")?;
    match head {
        Some(head) => {
            let mut ret = vec![head];
            let mut merge_heads = git::merge_heads::merge_heads(&repo_path)?;
            ret.append(&mut merge_heads);
            Ok(ret)
        }
        None => Ok(Vec::new()),
    }
}

// (repoPath: string, callback: (error, ret: string[])) => void;
pub fn get_workingtree_parents_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = get_workingtree_parent(&repo_path);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
