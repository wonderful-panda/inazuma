use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

// (repoPath: string, revspec: string, callback: (error, ret: CommitDetail)) => void;
pub fn get_commit_detail_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let revspec = cx.argument::<JsString>(1)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::commit_detail::get_commit_detail(&repo_path, &revspec);
        channel.send(move |mut cx| {
            let callback = callback.into_inner(&mut cx);
            let this = cx.undefined();
            let args = match result {
                Ok(commit_detail) => vec![
                    cx.null().upcast::<JsValue>(),
                    commit_detail.to_js_value(&mut cx)?.upcast(),
                ],
                Err(e) => vec![cx.error(e.to_string())?.upcast()],
            };
            callback.call(&mut cx, this, args)?;
            Ok(())
        });
    });

    Ok(cx.undefined())
}
