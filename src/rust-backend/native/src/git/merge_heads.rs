use std::path::Path;
use std::fs::File;
use std::io::prelude::*;
use super::GitError;

pub fn merge_heads(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let merge_head_file = repo_path.join(".git/MERGE_HEAD");
    let mut merge_heads: Vec<String> = Vec::new();
    if merge_head_file.exists() {
        let mut file = File::open(merge_head_file)?;
        let mut content = String::new();
        file.read_to_string(&mut content)?;
        for line in content.trim_end_matches('\n').lines() {
            merge_heads.push(line.to_string());
        }
    }
    Ok(merge_heads)
}


