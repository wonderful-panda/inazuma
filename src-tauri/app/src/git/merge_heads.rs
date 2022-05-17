use super::GitError;
use std::path::Path;
use tokio::fs::read_to_string;

pub async fn get_merge_heads(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let merge_head_file = repo_path.join(".git/MERGE_HEAD");
    let mut merge_heads: Vec<String> = Vec::new();
    if merge_head_file.exists() {
        let content = read_to_string(merge_head_file).await?;
        for line in content.trim_end_matches('\n').lines() {
            merge_heads.push(line.to_string());
        }
    }
    Ok(merge_heads)
}
