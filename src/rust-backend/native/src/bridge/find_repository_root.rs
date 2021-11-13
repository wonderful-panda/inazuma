use neon::prelude::*;

use super::*;
use crate::git;

// (callback: (error, ret: string)) => void;
pub fn find_repository_root_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let callback = cx.argument::<JsFunction>(0)?.root(&mut cx);
    let channel = cx.channel();
    std::thread::spawn(move || {
        let result = git::find_repository_root();
        invoke_callback(&channel, callback, result)
    });
    Ok(cx.undefined())
}
