use super::{exec, rev_parse, GitError};
use std::path::Path;

pub async fn stage(repo_path: &Path, rel_path: &str) -> Result<(), GitError> {
    let args = vec!["--", rel_path];
    let output = exec(repo_path, "add", &args, &[]).await?;
    GitError::assert_process_output("add", &output)?;
    Ok(())
}

pub async fn unstage(repo_path: &Path, rel_path: &str) -> Result<(), GitError> {
    if let Some(sha) = rev_parse::rev_parse(repo_path, "HEAD").await? {
        let args = vec![sha.as_str(), "--", rel_path];
        let output = exec(repo_path, "reset", &args, &[]).await?;
        GitError::assert_process_output("reset", &output)?;
    } else {
        let args = vec!["--cached", "--", rel_path];
        let output = exec(repo_path, "rm", &args, &[]).await?;
        GitError::assert_process_output("rm", &output)?;
    }
    Ok(())
}

pub async fn restore(repo_path: &Path, rel_path: &str) -> Result<(), GitError> {
    let args = vec!["--worktree", "--", rel_path];
    let output = exec(repo_path, "restore", &args, &[]).await?;
    GitError::assert_process_output("restore", &output)?;
    Ok(())
}
