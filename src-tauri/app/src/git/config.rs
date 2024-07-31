use super::{exec, GitError};
use std::path::Path;

pub async fn get_config_value(
    repo_path: &Path,
    name: &str,
    global: bool,
) -> Result<String, GitError> {
    let args = if global {
        vec!["--get", "--global", name]
    } else {
        vec!["--get", name]
    };
    let output = exec(repo_path, "config", &args, &[]).await?;
    GitError::assert_process_output("config", &output)?;
    let value = std::str::from_utf8(&output.stdout)
        .unwrap()
        .trim_end_matches('\n');
    Ok(value.to_owned())
}
