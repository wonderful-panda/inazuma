use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, maxCount: number, callback: (error, ret: Commit[])) => void
pub fn log_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let max_count = cx.argument::<JsNumber>(1)?.value(&mut cx) as u32;
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::log::log(repo_path, max_count, &[]);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}

// (
//    repoPath: string, relPath: string, maxCount: number, heads: ReadonlyArray<string>,
//    callback: (error, ret: FileLogEntry[])
// ) => void
pub fn filelog_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let rel_path = cx.argument::<JsString>(1)?.value(&mut cx);
    let max_count = cx.argument::<JsNumber>(2)?.value(&mut cx) as u32;
    let js_heads = cx.argument::<JsArray>(3)?.to_vec(&mut cx)?;
    let heads: Vec<String> = js_heads
        .iter()
        .map(|v| {
            v.downcast_or_throw::<JsString, _>(&mut cx)
                .map(|v| v.value(&mut cx))
        })
        .collect::<NeonResult<_>>()?;
    let callback = cx.argument::<JsFunction>(4)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let heads: Vec<&str> = heads.iter().map(AsRef::as_ref).collect();
        let result = git::log::filelog(repo_path, rel_path.as_str(), max_count, &heads[..]);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
