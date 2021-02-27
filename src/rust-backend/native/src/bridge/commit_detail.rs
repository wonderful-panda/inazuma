use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct GetCommitDetailTask {
    repo_path: String,
    revspec: String,
}

impl Task for GetCommitDetailTask {
    type Output = git::types::CommitDetail;
    type Error = git::GitError;
    type JsEvent = JsObject;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::commit_detail::get_commit_detail(&repo_path, &self.revspec)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let commit_detail = or_throw(&mut cx, result)?;
        commit_detail.to_js_value(&mut cx)
    }
}

// (repoPath: string, revspec: string, callback: (error, ret: CommitDetail)) => void;
pub fn get_commit_detail_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let revspec = cx.argument::<JsString>(1)?.value();
    let callback = cx.argument::<JsFunction>(2)?;
    let task = GetCommitDetailTask { repo_path, revspec };
    task.schedule(callback);
    Ok(cx.undefined())
}
