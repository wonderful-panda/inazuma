use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, message: string, callback: (error) => void);
pub fn commit(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let message = cx.argument::<JsString>(1)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::commit::commit(&repo_path, &message);
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
