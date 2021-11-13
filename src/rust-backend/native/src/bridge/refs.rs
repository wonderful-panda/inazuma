use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, callback: (error, ret: Refs)) => void;
pub fn refs_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::refs::refs(&repo_path);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
