use crate::state::pty::PtyStateMutex;
use portable_pty::ExitStatus;
use std::borrow::Cow;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Runtime, State};
use tauri::Emitter;


/// Replaces placeholders in a command line template with actual values.
///
/// Supported placeholders:
/// - `${repo}`: Repository path
/// - `${branch}`: Current branch name
/// - `${commit}`: Commit hash
///
/// # Arguments
/// * `template` - Command line template containing placeholders
/// * `repo_path` - Repository path (if None, error is returned when ${repo} is used)
/// * `branch` - Branch name (if None, error is returned when ${branch} is used)
/// * `commit` - Commit hash (if None, error is returned when ${commit} is used)
///
/// # Returns
/// * `Ok(String)` - Command line with all placeholders replaced
/// * `Err(String)` - Error message if a required variable is missing
///
/// # Examples
/// ```
/// let result = replace_placeholders(
///     "git show ${commit}",
///     Some("/path/to/repo"),
///     Some("main"),
///     Some("abc123")
/// );
/// assert_eq!(result, Ok("git show abc123".to_string()));
/// ```
pub fn replace_placeholders(
    template: &str,
    repo_path: Option<&str>,
    branch: Option<&str>,
    commit: Option<&str>,
) -> Result<String, String> {
    let mut result = template.to_string();

    // Check if placeholders are present and values are provided
    if result.contains("${repo}") {
        match repo_path {
            Some(path) => result = result.replace("${repo}", path),
            None => return Err("Repository path is required but not provided".to_string()),
        }
    }

    if result.contains("${branch}") {
        match branch {
            Some(br) => result = result.replace("${branch}", br),
            None => return Err("Branch name is required but not provided".to_string()),
        }
    }

    if result.contains("${commit}") {
        match commit {
            Some(cm) => result = result.replace("${commit}", cm),
            None => return Err("Commit hash is required but not provided".to_string()),
        }
    }

    Ok(result)
}

/// Executes a custom command in a PTY (pseudo-terminal).
///
/// This function is similar to `exec_git_with_pty` but for custom commands.
/// It replaces placeholders in the command line and executes it in a PTY.
///
/// # Arguments
/// * `id` - Unique PTY session identifier
/// * `repo_path` - Repository path (used for ${repo} placeholder and as cwd)
/// * `command_line` - Command line template with placeholders
/// * `branch` - Branch name (used for ${branch} placeholder)
/// * `commit` - Commit hash (used for ${commit} placeholder)
/// * `rows` - Number of terminal rows
/// * `cols` - Number of terminal columns
/// * `pty_state` - PTY state manager
/// * `app_handle` - Tauri application handle
#[tauri::command]
pub async fn exec_custom_command_with_pty<T: Runtime>(
    id: usize,
    repo_path: Option<String>,
    command_line: String,
    branch: Option<String>,
    commit: Option<String>,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
    app_handle: AppHandle<T>,
) -> Result<(), String> {
    // Replace placeholders
    let repo_str = repo_path.as_deref();
    let branch_str = branch.as_deref();
    let commit_str = commit.as_deref();
    let command_line = replace_placeholders(&command_line, repo_str, branch_str, commit_str)?;

    // Use repo_path as cwd, or current directory if not provided
    let cwd: Cow<Path> = if let Some(p) = repo_path {
        Cow::from(PathBuf::from(p))
    } else {
        Cow::from(PathBuf::from("."))
    };

    // Open PTY
    let handle_clone = AppHandle::clone(&app_handle);
    let on_data = move |id: crate::state::pty::PtyId, data: &[u8]| {
        let data = String::from_utf8(data.to_vec()).unwrap();
        if let Err(e) = handle_clone.emit(format!("pty-data:{}", id.0).as_str(), data) {
            warn!("Failed to emit pty-data event, {}", e);
        }
    };
    let handle_clone = AppHandle::clone(&app_handle);
    let on_exit = move |id: crate::state::pty::PtyId, exit_code: ExitStatus| {
        if let Err(e) =
            handle_clone.emit(format!("pty-exit:{}", id.0).as_str(), exit_code.success())
        {
            warn!("Failed to emit pty-exit event, {}", e);
        }
    };
    let mut pty = pty_state.0.lock().await;
    pty.open(
        crate::state::pty::PtyId(id),
        &command_line,
        &cwd,
        rows,
        cols,
        on_data,
        on_exit,
    )
    .await
    .map_err(|e| e.to_string())
}

/// Executes a custom command in the background (detached from the parent process).
///
/// The process is spawned and immediately detached. The function returns as soon as
/// the process is started, without waiting for it to complete. stdout/stderr are discarded.
///
/// # Arguments
/// * `repo_path` - Repository path (used for ${repo} placeholder and as cwd)
/// * `command_line` - Command line template with placeholders
/// * `branch` - Branch name (used for ${branch} placeholder)
/// * `commit` - Commit hash (used for ${commit} placeholder)
///
/// # Returns
/// * `Ok(())` - Process was successfully started
/// * `Err(String)` - Failed to start process (placeholder error or spawn error)
#[tauri::command]
pub async fn exec_custom_command_detached(
    repo_path: Option<String>,
    command_line: String,
    branch: Option<String>,
    commit: Option<String>,
) -> Result<(), String> {
    // Replace placeholders
    let repo_str = repo_path.as_deref();
    let branch_str = branch.as_deref();
    let commit_str = commit.as_deref();
    let command_line = replace_placeholders(&command_line, repo_str, branch_str, commit_str)?;

    // Use repo_path as cwd, or current directory if not provided
    let cwd = repo_path.unwrap_or_else(|| ".".to_string());

    // Split command line into program and arguments
    let args = crate::platform::split_commandline(&command_line)
        .map_err(|e| format!("Failed to parse command line: {}", e))?;

    if args.is_empty() {
        return Err("Command line is empty".to_string());
    }

    // Create command
    let mut cmd = tokio::process::Command::new(&args[0]);
    if args.len() > 1 {
        cmd.args(&args[1..]);
    }
    cmd.current_dir(&cwd);
    cmd.stdin(std::process::Stdio::null());
    cmd.stdout(std::process::Stdio::null());
    cmd.stderr(std::process::Stdio::null());

    // Platform-specific process group/job object handling
    #[cfg(unix)]
    {
        // On Unix: create a new process group using process_group(0)
        use std::os::unix::process::CommandExt as _;
        cmd.process_group(0);
    }

    #[cfg(windows)]
    {
        // On Windows: create detached process with new process group
        use std::os::windows::process::CommandExt as _;
        const DETACHED_PROCESS: u32 = 0x00000008;
        const CREATE_NEW_PROCESS_GROUP: u32 = 0x00000200;
        cmd.creation_flags(DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP);
    }

    // Spawn process
    cmd.spawn()
        .map_err(|e| format!("Failed to spawn command: {}", e))?;

    // Return immediately without waiting for process to complete
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_replace_repo_placeholder() {
        let result = replace_placeholders(
            "cd ${repo} && ls",
            Some("/path/to/repo"),
            None,
            None,
        );
        assert_eq!(result, Ok("cd /path/to/repo && ls".to_string()));
    }

    #[test]
    fn test_replace_branch_placeholder() {
        let result = replace_placeholders(
            "git log ${branch}",
            None,
            Some("main"),
            None,
        );
        assert_eq!(result, Ok("git log main".to_string()));
    }

    #[test]
    fn test_replace_commit_placeholder() {
        let result = replace_placeholders(
            "git show ${commit}",
            None,
            None,
            Some("abc123"),
        );
        assert_eq!(result, Ok("git show abc123".to_string()));
    }

    #[test]
    fn test_replace_all_placeholders() {
        let result = replace_placeholders(
            "cd ${repo} && git log ${branch} --since='1 week ago' ${commit}",
            Some("/path/to/repo"),
            Some("main"),
            Some("abc123"),
        );
        assert_eq!(
            result,
            Ok("cd /path/to/repo && git log main --since='1 week ago' abc123".to_string())
        );
    }

    #[test]
    fn test_no_placeholders() {
        let result = replace_placeholders(
            "echo 'Hello World'",
            None,
            None,
            None,
        );
        assert_eq!(result, Ok("echo 'Hello World'".to_string()));
    }

    #[test]
    fn test_missing_repo_value() {
        let result = replace_placeholders(
            "cd ${repo}",
            None,
            Some("main"),
            Some("abc123"),
        );
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Repository path is required but not provided");
    }

    #[test]
    fn test_missing_branch_value() {
        let result = replace_placeholders(
            "git log ${branch}",
            Some("/path/to/repo"),
            None,
            Some("abc123"),
        );
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Branch name is required but not provided");
    }

    #[test]
    fn test_missing_commit_value() {
        let result = replace_placeholders(
            "git show ${commit}",
            Some("/path/to/repo"),
            Some("main"),
            None,
        );
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Commit hash is required but not provided");
    }

    #[test]
    fn test_multiple_same_placeholders() {
        let result = replace_placeholders(
            "${repo}/file1 ${repo}/file2",
            Some("/path/to/repo"),
            None,
            None,
        );
        assert_eq!(result, Ok("/path/to/repo/file1 /path/to/repo/file2".to_string()));
    }
}
