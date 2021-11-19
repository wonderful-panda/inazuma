use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, revspec1: string, revspec2: string, callback: (error, ret: CommitDetail)) => void;
pub fn get_changes_between_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let revspec1 = cx.argument::<JsString>(1)?.value(&mut cx);
    let revspec2 = cx.argument::<JsString>(2)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(3)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::diff::get_changes_between(&repo_path, &revspec1, &revspec2);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
