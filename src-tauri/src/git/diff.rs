use super::commit_detail::parse_numstat_row;
use super::{exec, GitError};
use crate::types::*;
use std::path::Path;

pub async fn get_changes_between(
    repo_path: &Path,
    revspec1: &str,
    revspec2: &str,
) -> Result<Vec<FileEntry>, GitError> {
    let args = vec![
        revspec1,
        revspec2,
        "--raw",
        "--numstat",
        "--find-renames",
        "-z",
    ];
    let output = exec(repo_path, "diff", &args, &[]).await?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    parse_numstat_row(stdout)
}

pub async fn get_workingtree_udiff(
    repo_path: &Path,
    rel_path: &str,
    cached: bool,
) -> Result<Vec<u8>, GitError> {
    let mut args = vec!["--no-color"];
    if cached {
        args.push("--cached");
    }
    args.push("--");
    args.push(rel_path);
    let output = exec(repo_path, "diff", &args, &[]).await?;
    GitError::assert_process_output("diff", &output)?;
    Ok(output.stdout)
}
