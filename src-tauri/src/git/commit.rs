use super::{exec, GitError};
use std::path::Path;

fn assert_message_given(message: &str) -> Result<(), GitError> {
    if message.len() == 0 {
        Err(GitError::ArgumentError {
            command: String::from("commit"),
            message: String::from("no message given"),
        })
    } else {
        Ok(())
    }
}

pub async fn commit(repo_path: &Path, message: &str) -> Result<(), GitError> {
    assert_message_given(message)?;
    let args = vec!["-m", message];
    let output = exec(repo_path, "commit", &args, &[]).await?;
    GitError::assert_process_output("commit", &output)?;
    Ok(())
}

pub async fn commit_amend(repo_path: &Path, message: Option<&str>) -> Result<(), GitError> {
    let args = if let Some(message) = message {
        if message.len() == 0 {
            vec!["--amend", "-C", "HEAD"]
        } else {
            vec!["--amend", "-m", message]
        }
    } else {
        vec!["--amend", "-C", "HEAD"]
    };
    let output = exec(repo_path, "commit", &args, &[]).await?;
    GitError::assert_process_output("commit", &output)?;
    Ok(())
}
