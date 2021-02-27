pub mod blame;
pub mod commit_detail;
pub mod file;
pub mod log;
pub mod refs;
pub mod status;
pub mod types;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::Command;
use std::process::Output;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GitError {
    #[error("GitError({command},rc={exit_code}) {stderr}")]
    ExitCodeNonZero {
        command: String,
        exit_code: i32,
        stderr: String,
    },
    #[error("GitError({command},unexpected output) {text}")]
    UnexpectedOutput { command: String, text: String },
    #[error("GitError(exec failed) {}", .0.to_string())]
    ExecFailed(#[from] std::io::Error),
}

impl GitError {
    fn assert_process_output(command: &str, output: &Output) -> Result<(), GitError> {
        if output.status.success() {
            return Ok(());
        }
        let stderr = std::str::from_utf8(&output.stderr)
            .unwrap()
            .trim_end()
            .to_string();

        return Err(GitError::ExitCodeNonZero {
            command: command.to_string(),
            exit_code: output.status.code().unwrap(),
            stderr,
        });
    }
}

fn exec(
    repo_path: &Path,
    command: &str,
    args: &[&str],
    configs: &[&str],
) -> std::io::Result<Output> {
    let mut cmd = Command::new("git");
    cmd.arg("-C")
        .arg(repo_path)
        .arg("--git-dir")
        .arg(repo_path.join(".git"));
    configs.iter().for_each(|c| {
        cmd.args(&["-c", c]);
    });
    cmd.arg(command);
    cmd.args(args);
    if cfg!(target_os = "windows") {
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    return cmd.output();
}
