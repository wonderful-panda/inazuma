use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct RefsTask {
    repo_path: String,
}

impl Task for RefsTask {
    type Output = git::types::Refs;
    type Error = git::GitError;
    type JsEvent = JsObject;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::refs::refs(&repo_path)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let refs = or_throw(&mut cx, result)?;
        refs.to_js_value(&mut cx)
    }
}

// (repoPath: string, callback: (error, ret: Refs)) => void;
pub fn refs_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let callback = cx.argument::<JsFunction>(1)?;
    let task = RefsTask { repo_path };
    task.schedule(callback);
    Ok(cx.undefined())
}
