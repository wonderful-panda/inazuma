use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, message: string, callback: (error) => void);
pub fn commit_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let options = cx.argument::<JsObject>(1)?;
    let message = options
        .get(&mut cx, "message")
        .map_err(|_| ())
        .and_then(|v| v.downcast::<JsString, _>(&mut cx).map_err(|_| ()))
        .and_then(|v| Ok(Some(v.value(&mut cx))))
        .unwrap_or(None);
    let amend = options
        .get(&mut cx, "amend")
        .map_err(|_| ())
        .and_then(|v| v.downcast::<JsBoolean, _>(&mut cx).map_err(|_| ()))
        .and_then(|v| Ok(v.value(&mut cx)))
        .unwrap_or(false);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = if amend {
            git::commit::commit_amend(&repo_path, message.as_deref())
        } else if let Some(message) = message {
            git::commit::commit(&repo_path, &message)
        } else {
            Err(GitError::ArgumentError {
                command: String::from("commit"),
                message: String::from("No message given"),
            })
        };
        invoke_callback(&channel, callback, result)
    });

    Ok(cx.undefined())
}
