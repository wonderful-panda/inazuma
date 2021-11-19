use super::commit_detail::parse_numstat_row;
use super::types::*;
use super::{exec, GitError};
use std::path::Path;

pub fn get_changes_between(
    repo_path: &Path,
    revspec1: &str,
    revspec2: &str,
) -> Result<Vec<FileStat>, GitError> {
    let args = vec![
        revspec1,
        revspec2,
        "--raw",
        "--numstat",
        "--find-renames",
        "-z",
    ];
    let output = exec(repo_path, "diff", &args, &[])?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    parse_numstat_row(stdout)
}
