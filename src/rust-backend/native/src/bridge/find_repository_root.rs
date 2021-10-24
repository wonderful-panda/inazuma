use neon::prelude::*;

use super::*;
use crate::git;

// (callback: (error, ret: string)) => void;
pub fn find_repository_root_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let callback = cx.argument::<JsFunction>(0)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let result = git::find_repository_root();
        channel.send(move |mut cx| {
            let callback = callback.into_inner(&mut cx);
            let this = cx.undefined();
            let args = match result {
                Ok(Some(path)) => vec![
                    cx.null().upcast::<JsValue>(),
                    path.to_js_value(&mut cx)?.upcast(),
                ],
                Ok(None) => vec![
                    cx.null().upcast::<JsValue>(),
                    cx.undefined().upcast::<JsValue>(),
                ],
                Err(e) => vec![cx.error(e.to_string())?.upcast()],
            };
            callback.call(&mut cx, this, args)?;
            Ok(())
        });
    });
    Ok(cx.undefined())
}
