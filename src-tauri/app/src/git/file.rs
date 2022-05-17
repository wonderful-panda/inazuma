use super::{exec, GitError};
use std::path::Path;
use tokio::fs::write;

pub async fn get_content(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
) -> Result<Vec<u8>, GitError> {
    let target = if revspec == "STAGED" {
        format!(":{}", rel_path)
    } else {
        format!("{}:{}", revspec, rel_path)
    };
    let args = vec!["-p", target.as_str()];
    let output = exec(repo_path, "show", &args, &[]).await?;
    GitError::assert_process_output("show", &output)?;

    Ok(output.stdout)
}

pub async fn save_to(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
    dest_path: &Path,
) -> Result<(), GitError> {
    let content = get_content(repo_path, rel_path, revspec).await?;
    write(dest_path, content).await?;
    Ok(())
}
