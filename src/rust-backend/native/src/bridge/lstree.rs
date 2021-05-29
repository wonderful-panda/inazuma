use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct LstreeTask {
    repo_path: String,
    sha: String,
}

impl Task for LstreeTask {
    type Output = Vec<git::types::LstreeEntry>;
    type Error = git::GitError;
    type JsEvent = JsArray;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::lstree::lstree(&repo_path, &self.sha)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let entries = or_throw(&mut cx, result)?;
        entries.to_js_value(&mut cx)
    }
}

// (repoPath: string, sha: string, callback: (error, ret: Refs)) => void;
pub fn lstree_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let sha = cx.argument::<JsString>(1)?.value();
    let callback = cx.argument::<JsFunction>(2)?;
    let task = LstreeTask { repo_path, sha };
    task.schedule(callback);
    Ok(cx.undefined())
}
