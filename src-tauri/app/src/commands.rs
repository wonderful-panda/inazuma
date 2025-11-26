use std::borrow::Cow;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::str::FromStr;

use font_kit::sources::fs::FsSource;
use portable_pty::ExitStatus;
use tauri::{AppHandle, Runtime, State};
use tauri::{Emitter, Window};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;

use crate::git::build_command_line;
use crate::state::pty::{PtyId, PtyStateMutex};
use crate::state::stager::StagerStateMutex;
use crate::{
    git,
    state::{config::ConfigStateMutex, env::EnvStateMutex, repositories::RepositoriesStateMutex},
};
use types::*;

/// Loads persisted configuration and environment data.
///
/// Returns both the user configuration settings and the current environment state,
/// including recent opened repositories and other session data.
///
/// # Returns
/// A tuple containing the `Config` and `Environment` data.
#[tauri::command]
pub async fn load_persist_data(
    config_state: State<'_, ConfigStateMutex>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(Config, Environment), String> {
    let config = config_state.0.lock().await;
    let env = env_state.0.lock().await;
    Ok((config.config.clone(), env.env.clone()))
}

/// Stores the list of recently opened repositories.
///
/// Updates the environment state with a new list of recently opened repository paths.
///
/// # Arguments
/// * `new_list` - Vector of repository paths to store as recently opened
#[tauri::command]
pub async fn store_recent_opened(
    new_list: Vec<String>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(), String> {
    let mut env = env_state.0.lock().await;
    env.env.recent_opened = new_list.clone();
    Ok(())
}

/// Stores arbitrary application state as key-value pairs.
///
/// Updates the environment state with a new state map, typically used for
/// persisting UI state across sessions.
///
/// # Arguments
/// * `new_state` - HashMap containing state key-value pairs to store
#[tauri::command]
pub async fn store_state(
    new_state: HashMap<String, String>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(), String> {
    let mut env = env_state.0.lock().await;
    env.env.state = new_state.clone();
    Ok(())
}

/// Saves user configuration to persistent storage.
///
/// Persists the configuration settings to disk so they can be restored
/// in future sessions.
///
/// # Arguments
/// * `new_config` - The configuration object to save
///
/// # Errors
/// Returns an error if the configuration cannot be saved to disk.
#[tauri::command]
pub async fn save_config(
    new_config: Config,
    config_state: State<'_, ConfigStateMutex>,
) -> Result<(), String> {
    let mut config = config_state.0.lock().await;
    config
        .save(new_config)
        .map_err(|e| format!("Failed to save config, {}", e))
}

/// Shows a native folder selection dialog.
///
/// Opens a blocking folder picker dialog, allowing the user to select a directory.
/// The path is normalized with forward slashes.
///
/// # Returns
/// The selected folder path as a string, or `None` if the dialog was cancelled.
#[tauri::command]
pub async fn show_folder_selector<T: Runtime>(
    window: Window<T>,
    app_handle: AppHandle<T>,
) -> Option<String> {
    app_handle
        .dialog()
        .file()
        .set_parent(&window)
        .blocking_pick_folder()
        .map(|path| path.to_string().replace("\\", "/").into())
}

/// Opens a Git repository and starts watching for changes.
///
/// Initializes the repository in the application state and sets up file watching
/// to detect changes in the working directory.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository to open
///
/// # Errors
/// Returns an error if the repository cannot be opened or watching fails.
#[tauri::command]
pub async fn open_repository<R: Runtime>(
    repo_path: &Path,
    repo_state: State<'_, RepositoriesStateMutex>,
    stager_state: State<'_, StagerStateMutex>,
    app_handle: AppHandle<R>,
) -> Result<(), String> {
    let mut repositories = repo_state.0.lock().await;
    let repo = repositories.get_or_insert(repo_path);
    let mut stager = stager_state.0.lock().await;
    stager
        .watch(app_handle, repo)
        .map_err(|e| format!("{}", e))?;
    Ok(())
}

/// Closes a Git repository and stops watching for changes.
///
/// Removes the file watcher for the repository, cleaning up resources.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository to close
///
/// # Errors
/// Returns an error if unwatching fails.
#[tauri::command]
#[allow(unused_variables)]
pub async fn close_repository(
    repo_path: &Path,
    repo_state: State<'_, RepositoriesStateMutex>,
    stager_state: State<'_, StagerStateMutex>,
) -> Result<(), String> {
    let repositories = repo_state.0.lock().await;
    if let Some(repo) = repositories.get(repo_path) {
        let mut stager = stager_state.0.lock().await;
        stager.unwatch(repo).await.map_err(|e| format!("{}", e))?;
    }
    Ok(())
}

/// Fetches the commit history and references for a repository.
///
/// Retrieves the commit log along with all branches, tags, and reflog entries.
/// The reflog entries are merged into the refs structure.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `max_count` - Maximum number of commits to fetch
/// * `reflog_count` - Maximum number of reflog entries to fetch
///
/// # Returns
/// A tuple containing the list of commits and all references (including reflog).
#[tauri::command]
pub async fn fetch_history(
    repo_path: &Path,
    max_count: u32,
    reflog_count: u32,
) -> Result<(Vec<Commit>, Refs), String> {
    let reflog = git::refs::get_reflog(repo_path, reflog_count).await?;
    let heads = reflog.iter().map(|(_, id)| id.as_str()).collect::<Vec<_>>();
    let (commits, mut refs) = tokio::try_join!(
        git::log::log(repo_path, max_count, true, &heads[..]),
        git::refs::get_refs(&repo_path),
    )
    .map_err(|e| <git::GitError as Into<String>>::into(e))?;
    refs.refs.extend(
        reflog
            .into_iter()
            .enumerate()
            .map(|(index, (name, id))| Ref::Reflog {
                id,
                index,
                fullname: name.clone(),
                name,
            }),
    );
    Ok((commits, refs))
}

/// Gets the name of the currently checked out branch.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// The name of the current branch.
#[tauri::command]
pub async fn get_current_branch(repo_path: &Path) -> Result<String, String> {
    git::branch::get_current_branch(repo_path)
        .await
        .map_err(|e| e.into())
}

/// Gets the reflog entries for a repository.
///
/// Returns the reference log showing where branches and HEAD have pointed in the past.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `count` - Maximum number of reflog entries to retrieve
///
/// # Returns
/// A vector of tuples containing (reference name, commit ID) pairs.
#[tauri::command]
pub async fn get_reflog(repo_path: &Path, count: u32) -> Result<Vec<(String, String)>, String> {
    git::refs::get_reflog(repo_path, count)
        .await
        .map_err(|e| e.into())
}

/// Gets detailed information about a specific commit.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `revspec` - Git revision specification (commit hash, branch name, etc.)
///
/// # Returns
/// Detailed commit information including message, author, date, and changes.
#[tauri::command]
pub async fn get_commit_detail(repo_path: &Path, revspec: &str) -> Result<CommitDetail, String> {
    git::commit_detail::get_commit_detail(repo_path, revspec)
        .await
        .map_err(|e| e.into())
}

/// Gets the status of the working tree.
///
/// Returns information about staged and unstaged changes, including file statistics
/// (number of added/deleted lines) for each modified file.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// Working tree status containing files and their change statistics.
#[tauri::command]
pub async fn get_workingtree_stat<'a>(repo_path: &'a Path) -> Result<WorkingTreeStat, String> {
    let (mut files, parent_ids) = tokio::try_join!(
        git::status::status(repo_path),
        git::status::get_workingtree_parents(repo_path),
    )?;
    let staged_files_exists = files.iter().any(|f| f.kind == WorkingTreeFileKind::Staged);
    let unstaged_files_exists = files
        .iter()
        .any(|f| f.kind == WorkingTreeFileKind::Unstaged);

    let get_numstat_if_needed = |repo_path: &'a Path, cached: bool, needed: bool| async move {
        if needed {
            git::status::get_numstat(repo_path, cached)
                .await
                .map(|vec| vec.into_iter().collect::<HashMap<_, _>>())
        } else {
            Ok(HashMap::new())
        }
    };

    let (mut staged_numstat, mut unstaged_numstat) = tokio::try_join!(
        get_numstat_if_needed(repo_path, true, staged_files_exists),
        get_numstat_if_needed(repo_path, false, unstaged_files_exists),
    )?;

    for file in files.iter_mut() {
        file.delta = match file.kind {
            WorkingTreeFileKind::Staged => staged_numstat.remove(&file.path),
            WorkingTreeFileKind::Unstaged => unstaged_numstat.remove(&file.path),
            _ => None,
        };
    }
    Ok(WorkingTreeStat { files, parent_ids })
}

/// Gets blame information for a file.
///
/// Returns line-by-line authorship information, commit history for the file,
/// and the file content.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_path` - Relative path to the file within the repository
/// * `revspec` - Git revision specification to blame at
///
/// # Returns
/// Blame data including entries, commits, and base64-encoded file content.
#[tauri::command]
pub async fn get_blame(repo_path: &Path, rel_path: &str, revspec: &str) -> Result<Blame, String> {
    let (blame_entries, commits, content) = tokio::try_join!(
        git::blame::blame(repo_path, rel_path, revspec),
        git::log::filelog(repo_path, rel_path, 1000, true, &[]),
        git::file::get_content(repo_path, rel_path, revspec, false)
    )?;
    let content_base64 = base64::encode(&content);
    Ok(Blame {
        blame_entries,
        commits,
        content_base64,
    })
}

/// Gets the commit that last modified a file at or before a specified revision.
///
/// Finds the most recent commit that modified the specified file, searching from
/// the given revision backwards through the commit history.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_path` - Relative path to the file within the repository
/// * `revspec` - Git revision specification (commit hash, branch name, etc.)
///
/// # Returns
/// The full commit object including ID, author, date, and message, or `None` if no
/// commits are found that modified the file at or before the specified revision.
#[tauri::command]
pub async fn get_last_modify_commit(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
) -> Result<Option<Commit>, String> {
    git::log::get_last_modify_commit(repo_path, rel_path, revspec)
        .await
        .map_err(|e| e.into())
}

/// Gets file content at a specific revision, encoded as base64.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_path` - Relative path to the file within the repository
/// * `revspec` - Git revision specification to retrieve content from
///
/// # Returns
/// Base64-encoded file content.
#[tauri::command]
pub async fn get_content_base64(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
) -> Result<String, String> {
    let content = git::file::get_content(repo_path, rel_path, revspec, true).await?;
    Ok(base64::encode(&content))
}

/// Gets the directory tree at a specific revision.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `revspec` - Git revision specification
///
/// # Returns
/// List of entries in the tree (files and directories).
#[tauri::command]
pub async fn get_tree(repo_path: &Path, revspec: &str) -> Result<Vec<LstreeEntry>, String> {
    Ok(git::lstree::lstree(repo_path, revspec).await?)
}

/// Gets the file changes between two revisions.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `revspec1` - First Git revision specification
/// * `revspec2` - Second Git revision specification
///
/// # Returns
/// List of files that changed between the two revisions.
#[tauri::command]
pub async fn get_changes_between(
    repo_path: &Path,
    revspec1: &str,
    revspec2: &str,
) -> Result<Vec<FileEntry>, String> {
    Ok(git::diff::get_changes_between(repo_path, revspec1, revspec2).await?)
}

/// Gets the file changes introduced by a commit.
///
/// Compares the commit with its parent to show what was changed.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `revspec` - Git revision specification
///
/// # Returns
/// List of files changed in the commit.
///
/// # Errors
/// Returns an error if the parent commit is not found.
#[tauri::command]
pub async fn get_changes(repo_path: &Path, revspec: &str) -> Result<Vec<FileEntry>, String> {
    if let Some(parent) =
        git::rev_parse::rev_parse(repo_path, format!("{}~", revspec).as_str()).await?
    {
        Ok(git::diff::get_changes_between(repo_path, parent.as_str(), revspec).await?)
    } else {
        Err("Parent commit is not found".to_owned())
    }
}

/// Gets the unified diff for a file in the working tree, encoded as base64.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_path` - Relative path to the file within the repository
/// * `cached` - If true, get diff of staged changes; if false, get unstaged changes
///
/// # Returns
/// Base64-encoded unified diff.
#[tauri::command]
pub async fn get_workingtree_udiff_base64(
    repo_path: &Path,
    rel_path: &str,
    cached: bool,
) -> Result<String, String> {
    let binary_content = git::diff::get_workingtree_udiff(repo_path, rel_path, cached).await?;
    Ok(base64::encode(binary_content))
}

/// Stages files for commit.
///
/// Adds the specified files to the staging area (index).
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_paths` - List of relative file paths to stage
#[tauri::command]
pub async fn stage(repo_path: &Path, rel_paths: Vec<&str>) -> Result<(), String> {
    Ok(git::workingtree::stage(repo_path, &rel_paths).await?)
}

/// Unstages files from the staging area.
///
/// Removes the specified files from the staging area (index) while keeping
/// the changes in the working directory.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_paths` - List of relative file paths to unstage
#[tauri::command]
pub async fn unstage(repo_path: &Path, rel_paths: Vec<&str>) -> Result<(), String> {
    Ok(git::workingtree::unstage(repo_path, &rel_paths).await?)
}

/// Restores files to their state in the index.
///
/// Discards changes in the working directory for the specified files,
/// reverting them to their last committed or staged state.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `rel_paths` - List of relative file paths to restore
#[tauri::command]
pub async fn restore(repo_path: &Path, rel_paths: Vec<&str>) -> Result<(), String> {
    Ok(git::workingtree::restore(repo_path, &rel_paths).await?)
}

/// Creates a Git commit with staged changes.
///
/// Can create a new commit or amend the last commit depending on the options.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `options` - Commit options including the commit message and amend flag
#[tauri::command]
pub async fn commit(repo_path: &Path, options: CommitOptions) -> Result<(), String> {
    match options {
        CommitOptions::Normal { message } => {
            git::commit::commit(repo_path, &message).await?;
            Ok(())
        }
        CommitOptions::Amend {
            message: Some(message),
        } => {
            git::commit::commit_amend(repo_path, Some(&message)).await?;
            Ok(())
        }
        CommitOptions::Amend { message: None } => {
            git::commit::commit_amend(repo_path, None).await?;
            Ok(())
        }
    }
}

/// Creates a new Git branch.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `options` - Branch creation options including name and starting point
#[tauri::command]
pub async fn create_branch(repo_path: &Path, options: CreateBranchOptions) -> Result<(), String> {
    Ok(git::branch::create_branch(repo_path, &options).await?)
}

/// Deletes a Git branch.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `options` - Branch deletion options including name and force flag
#[tauri::command]
pub async fn delete_branch(repo_path: &Path, options: DeleteBranchOptions) -> Result<(), String> {
    Ok(git::branch::delete_branch(repo_path, &options).await?)
}

/// Switches to a different branch or commit.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `options` - Switch options including target branch/commit
#[tauri::command]
pub async fn switch(repo_path: &Path, options: SwitchOptions) -> Result<(), String> {
    Ok(git::switch::switch(repo_path, &options).await?)
}

/// Resets the current branch to a specific commit.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `options` - Reset options including target commit and reset mode (soft/mixed/hard)
#[tauri::command]
pub async fn reset(repo_path: &Path, options: ResetOptions) -> Result<(), String> {
    Ok(git::reset::reset(repo_path, &options).await?)
}

/// Gets the list of configured remote repositories.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// List of remote names (e.g., "origin", "upstream").
#[tauri::command]
pub async fn get_remote_list(repo_path: &Path) -> Result<Vec<String>, String> {
    Ok(git::remote::get_remote_list(repo_path).await?)
}

/// Opens an external diff tool to compare two file versions.
///
/// Prepares temporary files for both versions and launches the configured
/// external diff tool. The temporary files are watched for changes to detect
/// edits made in the external tool.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `left` - Left file specification (revision and path)
/// * `right` - Right file specification (revision and path)
///
/// # Errors
/// Returns an error if no external diff tool is configured or if the repository is not opened.
#[tauri::command]
pub async fn show_external_diff(
    repo_path: &Path,
    left: FileSpec,
    right: FileSpec,
    config_state: State<'_, ConfigStateMutex>,
    repo_state: State<'_, RepositoriesStateMutex>,
    stager_state: State<'_, StagerStateMutex>,
) -> Result<(), String> {
    let command_line = {
        let config = config_state.0.lock().await;
        if let Some(ref command_line) = config.config.external_diff_tool {
            command_line.clone()
        } else {
            return Err("External diff tool is not configured".into());
        }
    };
    let repo = {
        let repositories = repo_state.0.lock().await;
        repositories
            .get(repo_path)
            .ok_or_else(|| "Repository is not opened".to_owned())?
            .clone()
    };
    let (left_path, right_path) = tokio::try_join!(
        git::external_diff::prepare_diff_file(&repo, &left),
        git::external_diff::prepare_diff_file(&repo, &right),
    )
    .map_err(|e| format!("{}", e))?;

    git::external_diff::show_external_diff(&repo, &command_line, &left_path, &right_path)
        .await
        .map_err(|e| format!("{}", e))?;

    let stager = stager_state.0.lock().await;
    stager
        .try_register_temp_stage_file(&repo, &left, left_path)
        .await
        .map_err(|e| format!("Failed to watch stage file, {}", e))?;

    stager
        .try_register_temp_stage_file(&repo, &right, right_path)
        .await
        .map_err(|e| format!("Failed to watch stage file, {}", e))?;
    Ok(())
}

/// Copies text to the system clipboard.
///
/// # Arguments
/// * `text` - The text to copy to the clipboard
#[tauri::command]
pub async fn yank_text<T: Runtime>(text: &str, app_handle: AppHandle<T>) -> Result<(), String> {
    app_handle
        .clipboard()
        .write_text(text)
        .map_err(|e| format!("{}", e))
}

/// Opens a pseudo-terminal (PTY) and executes a command.
///
/// Creates a new PTY session and runs the specified command in it.
/// Output is emitted via Tauri events.
///
/// # Arguments
/// * `id` - Unique identifier for this PTY session
/// * `command_line` - Command to execute in the PTY
/// * `cwd` - Working directory for the command
/// * `rows` - Number of rows in the terminal
/// * `cols` - Number of columns in the terminal
#[tauri::command]
pub async fn open_pty<T: Runtime>(
    id: usize,
    command_line: &str,
    cwd: &Path,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
    app_handle: AppHandle<T>,
) -> Result<(), String> {
    open_pty_internal(id, command_line, cwd, rows, cols, pty_state, app_handle).await
}

async fn open_pty_internal<'a, T: Runtime, P: Into<Cow<'a, Path>>>(
    id: usize,
    command_line: &str,
    cwd: P,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
    app_handle: AppHandle<T>,
) -> Result<(), String> {
    let handle_clone = AppHandle::clone(&app_handle);
    let on_data = move |id: PtyId, data: &[u8]| {
        let data = String::from_utf8(data.to_vec()).unwrap();
        if let Err(e) = handle_clone.emit(format!("pty-data:{}", id.0).as_str(), data) {
            warn!("Failed to emit pty-data event, {}", e);
        }
    };
    let handle_clone = AppHandle::clone(&app_handle);
    let on_exit = move |id: PtyId, exit_code: ExitStatus| {
        if let Err(e) =
            handle_clone.emit(format!("pty-exit:{}", id.0).as_str(), exit_code.success())
        {
            warn!("Failed to emit pty-exit event, {}", e);
        }
    };
    let mut pty = pty_state.0.lock().await;
    pty.open(
        PtyId(id),
        command_line,
        &cwd.into(),
        rows,
        cols,
        on_data,
        on_exit,
    )
    .await
    .map_err(|e| format!("{}", e))?;
    return Ok(());
}

/// Writes data to a running PTY session.
///
/// Sends input to the pseudo-terminal, simulating user input.
///
/// # Arguments
/// * `id` - PTY session identifier
/// * `data` - Data to write to the PTY
#[tauri::command]
pub async fn write_pty(
    id: usize,
    data: String,
    pty_state: State<'_, PtyStateMutex>,
) -> Result<(), String> {
    let pty = pty_state.0.lock().await;
    pty.write(PtyId(id), data)
        .await
        .map_err(|e| format!("{}", e))
}

/// Closes a PTY session and terminates the running process.
///
/// # Arguments
/// * `id` - PTY session identifier
#[tauri::command]
pub async fn close_pty(id: usize, pty_state: State<'_, PtyStateMutex>) -> Result<(), String> {
    let pty = pty_state.0.lock().await;
    pty.kill(PtyId(id)).await.map_err(|e| format!("{}", e))
}

/// Resizes a PTY session.
///
/// Updates the terminal dimensions for a running PTY session.
///
/// # Arguments
/// * `id` - PTY session identifier
/// * `rows` - New number of rows
/// * `cols` - New number of columns
#[tauri::command]
pub async fn resize_pty(
    id: usize,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
) -> Result<(), String> {
    let pty = pty_state.0.lock().await;
    pty.resize(PtyId(id), rows, cols)
        .await
        .map_err(|e| format!("{}", e))
}

/// Executes a Git command in a PTY session.
///
/// Constructs a Git command line and runs it in a new PTY session,
/// allowing for interactive Git operations with terminal output.
///
/// # Arguments
/// * `id` - Unique identifier for this PTY session
/// * `repo_path` - Optional path to the Git repository
/// * `command` - Git subcommand to execute
/// * `args` - Arguments to pass to the Git command
/// * `rows` - Number of rows in the terminal
/// * `cols` - Number of columns in the terminal
#[tauri::command]
pub async fn exec_git_with_pty<T: Runtime>(
    id: usize,
    repo_path: Option<&Path>,
    command: &str,
    args: Vec<&str>,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
    app_handle: AppHandle<T>,
) -> Result<(), String> {
    let command_line = build_command_line(repo_path, command, &args[..]);
    let repo_path = if let Some(p) = repo_path {
        Cow::from(p)
    } else {
        Cow::from(PathBuf::from_str(".").unwrap())
    };
    open_pty_internal(
        id,
        &command_line,
        repo_path,
        rows,
        cols,
        pty_state,
        app_handle,
    )
    .await
}

/// Gets the configured Git user information.
///
/// Retrieves the user.name and user.email from the Git configuration.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// Git user information containing name and email.
#[tauri::command]
pub async fn get_user_info(repo_path: &Path) -> Result<GitUser, String> {
    let (name, email) = tokio::try_join!(
        git::config::get_config_value(repo_path, "user.name", false),
        git::config::get_config_value(repo_path, "user.email", false),
    )
    .map_err(|e| format!("{}", e))?;
    Ok(GitUser { name, email })
}

/// Finds the root directory of a Git repository.
///
/// Searches for a Git repository starting from the current directory and
/// traversing up the directory tree.
///
/// # Returns
/// The path to the repository root, or `None` if not inside a Git repository.
#[tauri::command]
pub async fn find_repository_root() -> Result<Option<String>, String> {
    Ok(git::find_repository_root().await?)
}

/// Gets a list of all fonts installed on the system.
///
/// Scans the system for available fonts and returns their metadata,
/// sorted alphabetically by full name.
///
/// # Returns
/// List of fonts with their names and properties (including monospace flag).
#[tauri::command]
pub async fn get_system_fonts() -> Result<Vec<Font>, String> {
    let source = FsSource::new();

    let handles = source.all_fonts().map_err(|e| format!("{}", e))?;
    let mut set: HashSet<Font> = HashSet::new();
    for h in handles.iter() {
        match h.load() {
            Ok(font) => {
                set.insert(Font {
                    full_name: font.full_name(),
                    family_name: font.family_name(),
                    monospace: font.is_monospace(),
                });
            }
            Err(e) => {
                warn!("Failed to load font: {:?}, {}", h, e);
            }
        }
    }
    let mut vec: Vec<_> = set.drain().collect();
    vec.sort_by(|a, b| a.full_name.cmp(&b.full_name));
    Ok(vec)
}

/// Sets the application window title.
///
/// # Arguments
/// * `title` - The new window title
#[tauri::command]
pub async fn set_window_title<T: Runtime>(title: &str, window: Window<T>) -> Result<(), String> {
    window.set_title(title).map_err(|e| format!("{}", e))
}
