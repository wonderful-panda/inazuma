use types::{ResetMode, ResetOptions};

use super::{exec, GitError};
use std::path::Path;

pub async fn reset(repo_path: &Path, options: &ResetOptions) -> Result<(), GitError> {
    let mut args: Vec<&str> = vec![&options.commit_id];
    let mode = match options.mode {
        ResetMode::Soft => "--soft",
        ResetMode::Mixed => "--mixed",
        ResetMode::Hard => "--hard",
    };
    args.push(mode);
    let output = exec(repo_path, "reset", &args, &[]).await?;
    GitError::assert_process_output("reset", &output)?;
    Ok(())
}
