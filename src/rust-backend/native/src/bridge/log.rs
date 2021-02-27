use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct LogTask {
    repo_path: String,
    max_count: u32,
}

impl Task for LogTask {
    type Output = Vec<git::types::Commit>;
    type Error = git::GitError;
    type JsEvent = JsArray;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        git::log::log(Path::new(self.repo_path.as_str()), self.max_count, &[])
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let commits = or_throw(&mut cx, result)?;
        commits.to_js_value(&mut cx)
    }
}

// (repoPath: string, maxCount: number, callback: (error, ret: Commit[])) => void
pub fn log_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let max_count = cx.argument::<JsNumber>(1)?.value() as u32;
    let callback = cx.argument::<JsFunction>(2)?;
    let task = LogTask {
        repo_path,
        max_count,
    };
    task.schedule(callback);
    Ok(cx.undefined())
}

struct FileLogTask {
    repo_path: String,
    rel_path: String,
    heads: Vec<String>,
    max_count: u32,
}

impl Task for FileLogTask {
    type Output = Vec<git::types::FileLogEntry>;
    type Error = git::GitError;
    type JsEvent = JsArray;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let heads: Vec<&str> = self.heads.iter().map(AsRef::as_ref).collect();
        git::log::filelog(
            Path::new(self.repo_path.as_str()),
            self.rel_path.as_str(),
            self.max_count,
            &heads[..],
        )
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

// (
//    repoPath: string, relPath: string, maxCount: number, heads: ReadonlyArray<string>,
//    callback: (error, ret: FileLogEntry[])
// ) => void
pub fn filelog_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let rel_path = cx.argument::<JsString>(1)?.value();
    let max_count = cx.argument::<JsNumber>(2)?.value() as u32;
    let js_heads = cx.argument::<JsArray>(3)?.to_vec(&mut cx)?;
    let heads: Vec<String> = js_heads
        .iter()
        .map(|v| {
            v.downcast_or_throw::<JsString, _>(&mut cx)
                .map(|v| v.value())
        })
        .collect::<NeonResult<_>>()?;
    let callback = cx.argument::<JsFunction>(4)?;
    let task = FileLogTask {
        repo_path,
        rel_path,
        max_count,
        heads,
    };
    task.schedule(callback);
    Ok(cx.undefined())
}
