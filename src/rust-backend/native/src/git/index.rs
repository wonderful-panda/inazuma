use super::{exec, rev_parse, GitError};
use std::path::Path;

pub fn add_to_index(repo_path: &Path, rel_path: &str) -> Result<(), GitError> {
    let args = vec!["--", rel_path];
    let output = exec(repo_path, "add", &args, &[])?;
    GitError::assert_process_output("add", &output)?;
    Ok(())
}

pub fn remove_from_index(repo_path: &Path, rel_path: &str) -> Result<(), GitError> {
    if let Some(sha) = rev_parse::rev_parse(repo_path, "HEAD")? {
        let args = vec![sha.as_str(), "--", rel_path];
        let output = exec(repo_path, "reset", &args, &[])?;
        GitError::assert_process_output("reset", &output)?;
    } else {
        let args = vec!["--cached", "--", rel_path];
        let output = exec(repo_path, "rm", &args, &[])?;
        GitError::assert_process_output("rm", &output)?;
    }
    Ok(())
}
