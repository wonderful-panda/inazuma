use crate::state::pty::PtyStateMutex;
use portable_pty::ExitStatus;
use std::borrow::Cow;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Runtime, State};
use tauri::Emitter;

/// Executes a custom command in a PTY (pseudo-terminal).
///
/// This function is similar to `exec_git_with_pty` but for custom commands.
/// The command line should have all placeholders already replaced by the frontend.
///
/// # Arguments
/// * `id` - Unique PTY session identifier
/// * `repo_path` - Repository path (used as working directory)
/// * `command_line` - Command line with placeholders already replaced
/// * `rows` - Number of terminal rows
/// * `cols` - Number of terminal columns
/// * `pty_state` - PTY state manager
/// * `app_handle` - Tauri application handle
#[tauri::command]
pub async fn exec_custom_command_with_pty<T: Runtime>(
    id: usize,
    repo_path: Option<String>,
    command_line: String,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
    app_handle: AppHandle<T>,
) -> Result<(), String> {
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
/// The command line should have all placeholders already replaced by the frontend.
///
/// # Arguments
/// * `repo_path` - Repository path (used as working directory)
/// * `command_line` - Command line with placeholders already replaced
///
/// # Returns
/// * `Ok(())` - Process was successfully started
/// * `Err(String)` - Failed to start process
#[tauri::command]
pub async fn exec_custom_command_detached(
    repo_path: Option<String>,
    command_line: String,
) -> Result<(), String> {
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
