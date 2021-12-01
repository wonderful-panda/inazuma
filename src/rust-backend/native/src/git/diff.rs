use super::commit_detail::parse_numstat_row;
use super::types::*;
use super::{exec, GitError};
use regex::Regex;
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

pub fn get_workingtree_udiff(
    repo_path: &Path,
    rel_path: &str,
    cached: bool,
) -> Result<Udiff, GitError> {
    let mut args = vec!["--no-color"];
    if cached {
        args.push("--cached");
    }
    args.push(rel_path);
    let output = exec(repo_path, "diff", &args, &[])?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    if stdout.len() == 0 {
        Ok(Udiff::NoDiff)
    } else {
        let patch_head_regex = Regex::new(r"(?m)^@@").unwrap();
        if let Some(m) = patch_head_regex.find(&stdout) {
            let content = String::from(&stdout[m.start()..]);
            Ok(Udiff::Text { content })
        } else {
            Ok(Udiff::Binary)
        }
    }
}
