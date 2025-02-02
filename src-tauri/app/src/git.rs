use std::process::Stdio;
use std::{path::Path, process::Output};
use thiserror::Error;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;

pub mod blame;
pub mod branch;
pub mod commit;
pub mod commit_detail;
pub mod config;
pub mod diff;
pub mod external_diff;
pub mod file;
pub mod log;
pub mod lstree;
pub mod merge_heads;
pub mod refs;
pub mod remote;
pub mod reset;
pub mod rev_parse;
pub mod status;
pub mod switch;
pub mod workingtree;

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
    #[error("GitError({command}, argument error) {message}")]
    ArgumentError { command: String, message: String },
}

impl GitError {
    pub fn assert_process_output(command: &str, output: &Output) -> Result<(), GitError> {
        if output.status.success() {
            Ok(())
        } else {
            let stderr = std::str::from_utf8(&output.stderr)
                .unwrap()
                .trim_end()
                .to_string();

            Err(GitError::ExitCodeNonZero {
                command: command.to_string(),
                exit_code: output.status.code().unwrap(),
                stderr,
            })
        }
    }
}

impl From<GitError> for String {
    fn from(e: GitError) -> Self {
        format!("{}", e)
    }
}

pub fn build_command_line(repo_path: Option<&Path>, command: &str, args: &[&str]) -> String {
    let mut command_line = if let Some(repo_path) = repo_path {
        let git_dir = repo_path.join(".git");
        format!(
            "git -C \"{}\" --git-dir \"{}\" {}",
            repo_path.to_str().unwrap(),
            git_dir.to_str().unwrap(),
            command
        )
    } else {
        format!("git {}", command)
    };
    for &a in args.iter() {
        command_line.push_str(" ");
        if a.contains(" ") {
            command_line.push_str("\"");
            command_line.push_str(a);
            command_line.push_str("\"");
        } else {
            command_line.push_str(a);
        }
    }
    command_line
}

pub async fn exec(
    repo_path: &Path,
    command: &str,
    args: &[&str],
    configs: &[&str],
) -> std::io::Result<Output> {
    exec_internal(repo_path, command, args, configs, None).await
}

pub async fn exec_with_stdin(
    repo_path: &Path,
    command: &str,
    args: &[&str],
    configs: &[&str],
    stdin_content: &[u8],
) -> std::io::Result<Output> {
    exec_internal(repo_path, command, args, configs, Some(stdin_content)).await
}

async fn exec_internal(
    repo_path: &Path,
    command: &str,
    args: &[&str],
    configs: &[&str],
    stdin_content: Option<&[u8]>,
) -> std::io::Result<Output> {
    let mut cmd = Command::new("git");
    cmd.env("GIT_TERMINAL_PROMPT", "0")
        .arg("-C")
        .arg(repo_path)
        .arg("--git-dir")
        .arg(repo_path.join(".git"));
    configs.iter().for_each(|c| {
        cmd.args(&["-c", c]);
    });
    cmd.arg(command);
    cmd.args(args);
    cmd.stdin(Stdio::piped());
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    debug!("{}, git {}, {:?}", repo_path.display(), command, args);
    let mut proc = cmd.spawn()?;
    if let Some(stdin_content) = stdin_content {
        if let Some(stdin) = &mut proc.stdin {
            stdin.write_all(stdin_content).await?;
            stdin.shutdown().await?;
        }
    }
    let output = proc.wait_with_output().await?;
    Ok(output)
}

pub async fn find_repository_root() -> Result<Option<String>, GitError> {
    let mut cmd = Command::new("git");
    cmd.env("GIT_TERMINAL_PROMPT", "0");
    cmd.arg("rev-parse");
    cmd.arg("--show-toplevel");
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    let ret = cmd
        .output()
        .await
        .or_else(|e| Err(GitError::ExecFailed(e)))?;
    if ret.status.success() {
        let path = std::str::from_utf8(&ret.stdout)
            .unwrap()
            .trim_end_matches('\n')
            .to_string();
        Ok(Some(path))
    } else {
        Ok(None)
    }
}
