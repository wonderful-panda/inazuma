use super::{exec, GitError};
use std::path::Path;

pub async fn get_remote_list(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let output = exec(repo_path, "remote", &[], &[]).await?;
    GitError::assert_process_output("remote", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    Ok(stdout.lines().map(|line| line.to_owned()).collect())
}
