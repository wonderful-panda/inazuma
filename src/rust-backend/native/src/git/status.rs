use super::commit_detail::parse_numstat_row;
use super::types::*;
use super::{exec, GitError};
use std::path::Path;

pub fn get_workingtree_stat(repo_path: &Path, cached: bool) -> Result<Vec<FileStat>, GitError> {
    let mut args = vec!["--raw", "--numstat", "--find-renames", "-z"];
    if cached {
        args.push("--cached");
    }
    let output = exec(repo_path, "diff", &args, &[])?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    parse_numstat_row(stdout)
}

pub fn get_untracked_files(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let args = vec!["-z", "--others", "--exclude-standard"];
    let output = exec(repo_path, "ls-files", &args, &[])?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let paths: Vec<String> = stdout
        .split("\0")
        .filter(|v| v.len() > 0)
        .map(|v| v.to_string())
        .collect();
    Ok(paths)
}
