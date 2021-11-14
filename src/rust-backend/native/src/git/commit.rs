use super::{exec, GitError};
use std::path::Path;

pub fn commit(repo_path: &Path, message: &str) -> Result<(), GitError> {
    let args = vec!["-m", message];
    let output = exec(repo_path, "commit", &args, &[])?;
    GitError::assert_process_output("commit", &output)?;
    Ok(())
}
