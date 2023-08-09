use super::commit_detail::parse_numstat_row;
use super::{exec, merge_heads, rev_parse, GitError};
use std::path::Path;
use types::*;

pub async fn get_workingtree_stat(
    repo_path: &Path,
    cached: bool,
) -> Result<Vec<FileEntry>, GitError> {
    let mut args = vec!["--raw", "--numstat", "--find-renames", "-z"];
    if cached {
        args.push("--cached");
    }
    let output = exec(repo_path, "diff", &args, &[]).await?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    parse_numstat_row(stdout)
}

pub async fn get_untracked_files(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let args = vec!["-z", "--others", "--exclude-standard"];
    let output = exec(repo_path, "ls-files", &args, &[]).await?;
    GitError::assert_process_output("ls-files", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let paths: Vec<String> = stdout
        .split("\0")
        .filter(|v| v.len() > 0)
        .map(|v| v.to_string())
        .collect();
    Ok(paths)
}

pub async fn get_workingtree_parents(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let head = rev_parse::rev_parse(&repo_path, "HEAD").await?;
    match head {
        Some(head) => {
            let mut ret = vec![head];
            let mut merge_heads = merge_heads::get_merge_heads(&repo_path).await?;
            ret.append(&mut merge_heads);
            Ok(ret)
        }
        None => Ok(Vec::new()),
    }
}
