use super::{exec, GitError};
use std::path::Path;

pub async fn rev_parse(repo_path: &Path, revspec: &str) -> Result<Option<String>, GitError> {
    let ret = exec(repo_path, "rev-parse", &vec![revspec], &[]).await?;
    if ret.status.success() {
        let sha = std::str::from_utf8(&ret.stdout)
            .unwrap()
            .trim_end_matches('\n')
            .to_string();
        Ok(Some(sha))
    } else {
        Ok(None)
    }
}
