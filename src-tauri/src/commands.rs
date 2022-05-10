use std::collections::{HashMap, HashSet};
use std::path::Path;

use font_kit::sources::fs::FsSource;
use portable_pty::ExitStatus;
use tauri::{api::dialog::blocking::FileDialogBuilder, Window};
use tauri::{AppHandle, ClipboardManager, Runtime, State};

use crate::state::pty::{PtyId, PtyStateMutex};
use crate::{
    git,
    state::{config::ConfigStateMutex, env::EnvStateMutex, repositories::RepositoriesStateMutex},
    types::*,
};

#[tauri::command]
pub async fn load_persist_data(
    config_state: State<'_, ConfigStateMutex>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(Config, Environment), String> {
    let config = config_state.0.lock().unwrap();
    let env = env_state.0.lock().unwrap();
    Ok((config.config.clone(), env.env.clone()))
}

#[tauri::command]
pub fn store_recent_opened(new_list: Vec<String>, env_state: State<'_, EnvStateMutex>) {
    let mut env = env_state.0.lock().unwrap();
    env.env.recent_opened = new_list;
}

#[tauri::command]
pub fn store_state(new_state: HashMap<String, String>, env_state: State<'_, EnvStateMutex>) {
    let mut env = env_state.0.lock().unwrap();
    env.env.state = new_state;
}

#[tauri::command]
pub async fn save_config(
    new_config: Config,
    config_state: State<'_, ConfigStateMutex>,
) -> Result<(), String> {
    let mut config = config_state.0.lock().unwrap();
    config
        .save(new_config)
        .map_err(|e| format!("Failed to save config, {}", e))
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
#[tauri::command]
pub async fn show_folder_selector<T: Runtime>(window: Window<T>) -> Option<String> {
    FileDialogBuilder::new()
        .set_parent(&window)
        .pick_folder()
        .map(|path| path.to_str().unwrap().replace("\\", "/").into())
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub async fn show_folder_selector() -> Option<String> {
    FileDialogBuilder::new()
        .pick_folder()
        .map(|path| path.to_str().unwrap().replace("\\", "/").into())
}

#[tauri::command]
pub async fn fetch_history(
    repo_path: &Path,
    max_count: u32,
) -> Result<(Vec<Commit>, Refs), String> {
    tokio::try_join!(
        git::log::log(repo_path, max_count, &[]),
        git::refs::get_refs(&repo_path),
    )
    .map_err(|e| e.into())
}

#[tauri::command]
pub async fn get_commit_detail(repo_path: &Path, revspec: &str) -> Result<CommitDetail, String> {
    git::commit_detail::get_commit_detail(repo_path, revspec)
        .await
        .map_err(|e| e.into())
}

#[tauri::command]
pub async fn get_workingtree_stat(repo_path: &Path) -> Result<WorkingTreeStat, String> {
    let (untracked_files, mut unstaged_files, staged_files, parent_ids) = tokio::try_join!(
        git::status::get_untracked_files(repo_path),
        git::status::get_workingtree_stat(repo_path, false),
        git::status::get_workingtree_stat(repo_path, true),
        git::status::get_workingtree_parents(repo_path)
    )?;
    let untracked_files = untracked_files
        .iter()
        .map(|f| FileEntry::new(f, "?", None, None));

    unstaged_files.extend(untracked_files);
    Ok(WorkingTreeStat {
        unstaged_files,
        staged_files,
        parent_ids,
    })
}

#[tauri::command]
pub async fn get_blame(repo_path: &Path, rel_path: &str, revspec: &str) -> Result<Blame, String> {
    let (blame_entries, commits, content) = tokio::try_join!(
        git::blame::blame(repo_path, rel_path, revspec),
        git::log::filelog(repo_path, rel_path, 1000, &[]),
        git::file::get_content(repo_path, rel_path, revspec)
    )?;
    let content_base64 = base64::encode(&content);
    Ok(Blame {
        blame_entries,
        commits,
        content_base64,
    })
}

#[tauri::command]
pub async fn get_content_base64(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
) -> Result<String, String> {
    let content = git::file::get_content(repo_path, rel_path, revspec).await?;
    Ok(base64::encode(&content))
}

#[tauri::command]
pub async fn get_tree(repo_path: &Path, revspec: &str) -> Result<Vec<LstreeEntry>, String> {
    Ok(git::lstree::lstree(repo_path, revspec).await?)
}

#[tauri::command]
pub async fn get_changes_between(
    repo_path: &Path,
    revspec1: &str,
    revspec2: &str,
) -> Result<Vec<FileEntry>, String> {
    Ok(git::diff::get_changes_between(repo_path, revspec1, revspec2).await?)
}

#[tauri::command]
pub async fn get_workingtree_udiff_base64(
    repo_path: &Path,
    rel_path: &str,
    cached: bool,
) -> Result<String, String> {
    let binary_content = git::diff::get_workingtree_udiff(repo_path, rel_path, cached).await?;
    Ok(base64::encode(binary_content))
}

#[tauri::command]
pub async fn stage(repo_path: &Path, rel_path: &str) -> Result<(), String> {
    Ok(git::index::stage(repo_path, rel_path).await?)
}

#[tauri::command]
pub async fn unstage(repo_path: &Path, rel_path: &str) -> Result<(), String> {
    Ok(git::index::unstage(repo_path, rel_path).await?)
}

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

#[tauri::command]
pub async fn show_external_diff(
    repo_path: &Path,
    left: FileSpec,
    right: FileSpec,
    config_state: State<'_, ConfigStateMutex>,
    repo_state: State<'_, RepositoriesStateMutex>,
) -> Result<(), String> {
    let command_line = {
        let config = config_state.0.lock().unwrap();
        if let Some(ref command_line) = config.config.external_diff_tool {
            command_line.clone()
        } else {
            return Err("External diff tool is not configured".into());
        }
    };
    let repo = {
        let mut repositories = repo_state.0.lock().unwrap();
        repositories.get_or_insert(repo_path.to_path_buf()).clone()
    };
    git::external_diff::show_external_diff(&repo, &command_line, &left, &right)
        .await
        .map_err(|e| format!("{}", e))?;
    Ok(())
}

#[tauri::command]
pub fn yank_text<T: Runtime>(text: &str, app_handle: AppHandle<T>) -> Result<(), String> {
    app_handle
        .clipboard_manager()
        .write_text(text)
        .map_err(|e| format!("{}", e))
}

#[tauri::command]
pub fn open_pty<T: Runtime>(
    command_line: &str,
    cwd: &Path,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
    window: Window<T>,
) -> Result<usize, String> {
    let win1 = window.clone();
    let on_data = move |id: PtyId, data: &[u8]| {
        let data = String::from_utf8(data.to_vec()).unwrap();
        if let Err(e) = win1.emit(format!("pty-data:{}", id.0).as_str(), data) {
            warn!("Failed to emit pty-data event, {}", e);
        }
    };
    let win2 = window.clone();
    let on_exit = move |id: PtyId, exit_code: ExitStatus| {
        if let Err(e) = win2.emit(format!("pty-exit:{}", id.0).as_str(), exit_code.success()) {
            warn!("Failed to emit pty-exit event, {}", e);
        }
    };
    let mut pty = pty_state.0.lock().unwrap();
    let id = pty
        .open(command_line, cwd, rows, cols, on_data, on_exit)
        .map_err(|e| format!("{}", e))?;
    return Ok(id.0);
}

#[tauri::command]
pub fn write_pty(id: usize, data: &str, pty_state: State<'_, PtyStateMutex>) -> Result<(), String> {
    let pty = pty_state.0.lock().unwrap();
    pty.write(PtyId(id), data.as_bytes())
        .map_err(|e| format!("{}", e))
}

#[tauri::command]
pub fn close_pty(id: usize, pty_state: State<'_, PtyStateMutex>) -> Result<(), String> {
    let pty = pty_state.0.lock().unwrap();
    pty.kill(PtyId(id)).map_err(|e| format!("{}", e))
}

#[tauri::command]
pub fn resize_pty(
    id: usize,
    rows: u16,
    cols: u16,
    pty_state: State<'_, PtyStateMutex>,
) -> Result<(), String> {
    let pty = pty_state.0.lock().unwrap();
    pty.resize(PtyId(id), rows, cols)
        .map_err(|e| format!("{}", e))
}

#[tauri::command]
pub async fn find_repository_root() -> Result<Option<String>, String> {
    Ok(git::find_repository_root().await?)
}

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
