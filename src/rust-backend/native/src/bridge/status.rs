use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct GetWorkingTreeStatTask {
    repo_path: String,
    cached: bool,
}

impl Task for GetWorkingTreeStatTask {
    type Output = Vec<git::types::FileStat>;
    type Error = git::GitError;
    type JsEvent = JsArray;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::status::get_workingtree_stat(&repo_path, self.cached)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let files = or_throw(&mut cx, result)?;
        files.to_js_value(&mut cx)
    }
}

// (repoPath: string, cached: boolean, callback: (error, ret: FileStat[])) => void;
pub fn get_workingtree_stat_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let cached = cx.argument::<JsBoolean>(1)?.value();
    let callback = cx.argument::<JsFunction>(2)?;
    let task = GetWorkingTreeStatTask { repo_path, cached };
    task.schedule(callback);
    Ok(cx.undefined())
}

struct GetUntrackedFilesTask {
    repo_path: String,
}

impl Task for GetUntrackedFilesTask {
    type Output = Vec<String>;
    type Error = git::GitError;
    type JsEvent = JsArray;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::status::get_untracked_files(&repo_path)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let files = or_throw(&mut cx, result)?;
        files.to_js_value(&mut cx)
    }
}

// (repoPath: string, cached: boolean, callback: (error, ret: FileStat[])) => void;
pub fn get_untracked_files_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let callback = cx.argument::<JsFunction>(1)?;
    let task = GetUntrackedFilesTask { repo_path };
    task.schedule(callback);
    Ok(cx.undefined())
}
