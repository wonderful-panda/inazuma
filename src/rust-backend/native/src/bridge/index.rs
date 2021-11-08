use neon::prelude::*;
use std::path::Path;

use crate::git;

// (repoPath: string, relPath: string, callback: (error) => void);
pub fn add_to_index_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let rel_path = cx.argument::<JsString>(1)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::index::add_to_index(&repo_path, &rel_path);
        channel.send(move |mut cx| {
            let callback = callback.into_inner(&mut cx);
            let this = cx.undefined();
            let args = match result {
                Ok(_) => vec![cx.null().upcast::<JsValue>()],
                Err(e) => vec![cx.error(e.to_string())?.upcast()],
            };
            callback.call(&mut cx, this, args)?;
            Ok(())
        });
    });

    Ok(cx.undefined())
}

// (repoPath: string, relPath: string, callback: (error) => void);
pub fn remove_from_index_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let rel_path = cx.argument::<JsString>(1)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let repo_path = Path::new(&repo_path);
        let result = git::index::remove_from_index(&repo_path, &rel_path);
        channel.send(move |mut cx| {
            let callback = callback.into_inner(&mut cx);
            let this = cx.undefined();
            let args = match result {
                Ok(_) => vec![cx.null().upcast::<JsValue>()],
                Err(e) => vec![cx.error(e.to_string())?.upcast()],
            };
            callback.call(&mut cx, this, args)?;
            Ok(())
        });
    });

    Ok(cx.undefined())
}
