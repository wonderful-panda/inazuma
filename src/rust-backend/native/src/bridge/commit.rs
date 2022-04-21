use neon::prelude::*;
use std::path::Path;

use super::{js_object_extension::JsObjectExtension, *};
use crate::git;

// (repoPath: string, message: string, callback: (error) => void);
pub fn commit_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let options = cx.argument::<JsObject>(1)?;
    let message = options.string_or_none(&mut cx, "message")?;
    let amend = options.boolean_or_none(&mut cx, "amend")?.unwrap_or(false);

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
