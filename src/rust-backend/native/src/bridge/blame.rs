use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct BlameTask {
    repo_path: String,
    rel_path: String,
    sha: String,
}

impl Task for BlameTask {
    type Output = Vec<git::types::BlameEntry>;
    type Error = git::GitError;
    type JsEvent = JsArray;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::blame::blame(&repo_path, &self.rel_path, &self.sha)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let blame = or_throw(&mut cx, result)?;
        blame.to_js_value(&mut cx)
    }
}

// (repoPath: string, relPath: string, sha: string, callback: (error, ret: BlameEntry[])) => void;
pub fn blame_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let rel_path = cx.argument::<JsString>(1)?.value();
    let sha = cx.argument::<JsString>(2)?.value();
    let callback = cx.argument::<JsFunction>(3)?;
    let task = BlameTask {
        repo_path,
        rel_path,
        sha,
    };
    task.schedule(callback);
    Ok(cx.undefined())
}
