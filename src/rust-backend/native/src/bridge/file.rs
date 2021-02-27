use neon::prelude::*;
use std::path::Path;

use super::*;
use crate::git;

struct GetContentTask {
    repo_path: String,
    rel_path: String,
    sha: String,
}

impl Task for GetContentTask {
    type Output = Vec<u8>;
    type Error = git::GitError;
    type JsEvent = JsBuffer;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::file::get_content(&repo_path, &self.rel_path, &self.sha)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        let bytes = or_throw(&mut cx, result)?;
        bytes.to_js_value(&mut cx)
    }
}

// (repoPath: string, relPath: string, sha: string, callback: (error, ret: Buffer)) => void;
pub fn get_content_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let rel_path = cx.argument::<JsString>(1)?.value();
    let sha = cx.argument::<JsString>(2)?.value();
    let callback = cx.argument::<JsFunction>(3)?;
    let task = GetContentTask {
        repo_path,
        rel_path,
        sha,
    };
    task.schedule(callback);
    Ok(cx.undefined())
}

struct SaveToTask {
    repo_path: String,
    rel_path: String,
    sha: String,
    dest_path: String,
}

impl Task for SaveToTask {
    type Output = ();
    type Error = git::GitError;
    type JsEvent = JsUndefined;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let repo_path = Path::new(&self.repo_path);
        git::file::save_to(&repo_path, &self.rel_path, &self.sha, &self.dest_path)
    }

    fn complete<'a>(
        self,
        mut cx: TaskContext<'a>,
        _result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        Ok(cx.undefined())
    }
}

// (repoPath: string, relPath: string, sha: string, destPath: string, callback: (error, ret: undefined)) => void;
pub fn save_to_async(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let repo_path = cx.argument::<JsString>(0)?.value();
    let rel_path = cx.argument::<JsString>(1)?.value();
    let sha = cx.argument::<JsString>(2)?.value();
    let dest_path = cx.argument::<JsString>(3)?.value();
    let callback = cx.argument::<JsFunction>(4)?;
    let task = SaveToTask {
        repo_path,
        rel_path,
        sha,
        dest_path,
    };
    task.schedule(callback);
    Ok(cx.undefined())
}
