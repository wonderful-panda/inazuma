use types::{CreateBranchOptions, DeleteBranchOptions, SwitchCreateOptions, SwitchOptions};

use super::{exec, switch, GitError};
use std::path::Path;

pub async fn create_branch(
    repo_path: &Path,
    options: &CreateBranchOptions,
) -> Result<(), GitError> {
    if options.switch.is_some_and(|v| v) {
        let options = Clone::clone(options);
        let options = SwitchOptions {
            branch_name: options.branch_name,
            create: Some(SwitchCreateOptions {
                commit_id: options.commit_id,
                force: options.force,
            }),
        };
        switch::switch(repo_path, &options).await
    } else {
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
}

pub async fn delete_branch(
    repo_path: &Path,
    options: &DeleteBranchOptions,
) -> Result<(), GitError> {
    let mut args: Vec<&str> = Vec::new();
    args.push(if options.force.is_some_and(|v| v) {
        "-D"
    } else {
        "-d"
    });
    args.push(&options.branch_name);
    let output = exec(repo_path, "branch", &args, &[]).await?;
    GitError::assert_process_output("branch", &output)?;
    Ok(())
}

pub async fn get_current_branch(repo_path: &Path) -> Result<String, GitError> {
    let args = ["--show-current"];
    let output = exec(repo_path, "branch", &args, &[]).await?;
    GitError::assert_process_output("branch", &output)?;
    let branch_name = std::str::from_utf8(&output.stdout)
        .unwrap()
        .trim_end_matches('\n')
        .to_owned();
    Ok(branch_name)
}
