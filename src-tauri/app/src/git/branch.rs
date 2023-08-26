use types::CreateBranchOptions;

use super::{exec, GitError};
use std::path::Path;

pub async fn create_branch(
    repo_path: &Path,
    options: &CreateBranchOptions,
) -> Result<(), GitError> {
    if options.checkout.is_some_and(|v| v) {
        return checkout_new_branch(repo_path, options).await;
    }
    let mut args: Vec<&str> = Vec::new();
    if options.force.is_some_and(|v| v) {
        args.push("-f");
    }
    args.push(&options.branch_name);
    args.push(&options.commit_id);
    let output = exec(repo_path, "branch", &args, &[]).await?;
    GitError::assert_process_output("branch", &output)?;
    Ok(())
}

async fn checkout_new_branch(
    repo_path: &Path,
    options: &CreateBranchOptions,
) -> Result<(), GitError> {
    assert!(options.checkout.is_some_and(|v| v));
    let args = vec![
        if options.force.is_some_and(|v| v) {
            "-B"
        } else {
            "-b"
        },
        &options.branch_name,
        &options.commit_id,
    ];
    let output = exec(repo_path, "checkout", &args, &[]).await?;
    GitError::assert_process_output("branch", &output)?;
    Ok(())
}
