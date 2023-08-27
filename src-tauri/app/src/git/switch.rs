use types::SwitchOptions;

use super::{exec, GitError};
use std::path::Path;

pub async fn switch(repo_path: &Path, options: &SwitchOptions) -> Result<(), GitError> {
    let args: Vec<&str>;
    if let Some(ref create_options) = options.create {
        args = vec![
            if create_options.force.is_some_and(|v| v) {
                "-B"
            } else {
                "-b"
            },
            &options.branch_name,
            &create_options.commit_id,
        ];
    } else {
        args = vec![&options.branch_name];
    }
    let output = exec(repo_path, "switch", &args, &[]).await?;
    GitError::assert_process_output("switch", &output)?;
    Ok(())
}
