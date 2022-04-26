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
    if let Err(e) = config.save(new_config) {
        warn!("save_config: {}", e);
        Err(format!("Failed to save config, {}", e))
    } else {
        Ok(())
    }
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
    repo_path: String,
    max_count: u32,
) -> Result<(Vec<Commit>, Refs), String> {
    let ret = tokio::try_join!(
        git::log::log(Path::new(&repo_path), max_count, &[]),
        git::refs::get_refs(Path::new(&repo_path)),
    );
    ret.or_else(|e| {
        error!("fetch_history: {}", e);
        Err(e.into())
    })
}

#[tauri::command]
pub async fn get_commit_detail(repo_path: String, revspec: String) -> Result<CommitDetail, String> {
    let repo_path = Path::new(&repo_path);
    git::commit_detail::get_commit_detail(&repo_path, &revspec)
        .await
        .or_else(|e| {
            error!("get_command_detail: {}", e);
            Err(e.into())
        })
}

#[tauri::command]
pub async fn get_workingtree_stat(repo_path: String) -> Result<WorkingTreeStat, String> {
    let repo_path = Path::new(&repo_path);
    let ret = tokio::try_join!(
        git::status::get_untracked_files(&repo_path),
        git::status::get_workingtree_stat(&repo_path, false),
        git::status::get_workingtree_stat(&repo_path, true),
        git::status::get_workingtree_parents(&repo_path)
    );
    match ret {
        Ok((untracked_files, mut unstaged_files, staged_files, parent_ids)) => {
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
        Err(e) => Err(e.into()),
    }
}

#[tauri::command]
pub fn yank_text<T: Runtime>(text: String, app_handle: AppHandle<T>) -> Result<(), String> {
    app_handle
        .clipboard_manager()
        .write_text(text)
        .map_err(|e| format!("{}", e))
}
