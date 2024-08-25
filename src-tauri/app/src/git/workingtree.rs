use regex::Regex;

use super::{exec, exec_with_stdin, rev_parse, GitError};
use std::path::Path;

pub async fn stage(repo_path: &Path, rel_paths: &[&str]) -> Result<(), GitError> {
    let args = vec!["--pathspec-from-file=-"];
    let stdin_data = rel_paths.join("\n");

    let output = exec_with_stdin(repo_path, "add", &args, &[], stdin_data.as_bytes()).await?;
    GitError::assert_process_output("add", &output)?;
    Ok(())
}

pub async fn unstage(repo_path: &Path, rel_paths: &[&str]) -> Result<(), GitError> {
    let stdin_data = rel_paths.join("\n");
    if let Some(sha) = rev_parse::rev_parse(repo_path, "HEAD").await? {
        let args = vec![sha.as_str(), "--pathspec-from-file=-"];
        let output = exec_with_stdin(repo_path, "reset", &args, &[], stdin_data.as_bytes()).await?;
        GitError::assert_process_output("reset", &output)?;
    } else {
        let args = vec!["--cached", "--pathspec-from-file=-"];
        let output = exec_with_stdin(repo_path, "rm", &args, &[], stdin_data.as_bytes()).await?;
        GitError::assert_process_output("rm", &output)?;
    }
    Ok(())
}

pub async fn restore(repo_path: &Path, rel_paths: &[&str]) -> Result<(), GitError> {
    let stdin_data = rel_paths.join("\n");
    let args = vec!["--worktree", "--pathspec-from-file=-"];
    let output = exec_with_stdin(repo_path, "restore", &args, &[], stdin_data.as_bytes()).await?;
    GitError::assert_process_output("restore", &output)?;
    Ok(())
}

struct Index {
    pub mode: u32,
    pub hash: String,
    pub stage: u8,
    pub path: String,
}

impl Index {
    fn format_z(&self) -> String {
        format!(
            "{} {} {}\t{}\0",
            self.mode, self.hash, self.stage, self.path
        )
    }
}

fn parse_index_info(text: &str) -> Option<Index> {
    let regex = Regex::new(r"^(\d{6}) ([a-f0-9]{40}) (\d)\t(.+)$").unwrap();
    regex.captures(text.trim_end_matches('\0')).map(|c| Index {
        mode: c[1].parse().unwrap(),
        hash: c[2].to_owned(),
        stage: c[3].parse().unwrap(),
        path: c[4].to_owned(),
    })
}

pub async fn update_index(
    repo_path: &Path,
    rel_path: &str,
    content: &Path,
) -> Result<(), GitError> {
    let output = exec(
        repo_path,
        "hash-object",
        &["-w", "--", content.to_str().unwrap()],
        &[],
    )
    .await?;
    GitError::assert_process_output("hash-object", &output)?;
    let hash = std::str::from_utf8(&output.stdout)
        .unwrap()
        .trim_end_matches('\n');

    let output = exec(
        repo_path,
        "ls-files",
        &["--stage", "-z", "--", rel_path],
        &[],
    )
    .await?;
    GitError::assert_process_output("ls-files", &output)?;

    let index_info = std::str::from_utf8(&output.stdout).unwrap();
    let mut idx = parse_index_info(index_info).ok_or_else(|| GitError::UnexpectedOutput {
        command: "ls-files".to_owned(),
        text: index_info.to_owned(),
    })?;
    idx.hash = hash.to_owned();
    let new_index_info = idx.format_z();
    let output = exec_with_stdin(
        repo_path,
        "update-index",
        &["-z", "--index-info"],
        &[],
        new_index_info.as_bytes(),
    )
    .await?;
    GitError::assert_process_output("update-index", &output)?;
    Ok(())
}
