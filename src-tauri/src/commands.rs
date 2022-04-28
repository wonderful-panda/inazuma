use std::collections::HashMap;
use std::path::Path;

use tauri::{api::dialog::blocking::FileDialogBuilder, Window};
use tauri::{AppHandle, ClipboardManager, Runtime, State};

use crate::{
    git,
    state::{config::ConfigStateMutex, env::EnvStateMutex},
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

#[tauri::command]
pub async fn show_folder_selector<T: Runtime>(window: Window<T>) -> Option<String> {
    FileDialogBuilder::new()
        .set_parent(&window)
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
pub fn yank_text<T: Runtime>(text: &str, app_handle: AppHandle<T>) -> Result<(), String> {
    app_handle
        .clipboard_manager()
        .write_text(text)
        .map_err(|e| format!("{}", e))
}
