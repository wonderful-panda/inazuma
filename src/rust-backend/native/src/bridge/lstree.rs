use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, sha: string, callback: (error, ret: Refs)) => void;
pub fn lstree_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let sha = cx.argument::<JsString>(1)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::lstree::lstree(&repo_path, &sha);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
