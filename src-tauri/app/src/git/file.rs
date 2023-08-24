use super::{exec, GitError};
use std::path::Path;
use tokio::fs::write;

pub async fn get_content(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
    apply_filters: bool,
) -> Result<Vec<u8>, GitError> {
    let target = if revspec == "STAGED" {
        format!(":{}", rel_path)
    } else {
        format!("{}:{}", revspec, rel_path)
    };
    let args = if apply_filters {
        vec!["--filters", target.as_str()]
    } else {
        vec!["-p", target.as_str()]
    };
    let output = exec(repo_path, "cat-file", &args, &[]).await?;
    GitError::assert_process_output("cat-file", &output)?;

    Ok(output.stdout)
}

pub async fn save_to(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
    dest_path: &Path,
    apply_filters: bool,
) -> Result<(), GitError> {
    let content = get_content(repo_path, rel_path, revspec, apply_filters).await?;
    write(dest_path, content).await?;
    Ok(())
}
