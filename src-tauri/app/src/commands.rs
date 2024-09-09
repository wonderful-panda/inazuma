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

#[tauri::command]
pub async fn load_persist_data(
    config_state: State<'_, ConfigStateMutex>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(Config, Environment), String> {
    let config = config_state.0.lock().await;
    let env = env_state.0.lock().await;
    Ok((config.config.clone(), env.env.clone()))
}

#[tauri::command]
pub async fn store_recent_opened(
    new_list: Vec<String>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(), String> {
    let mut env = env_state.0.lock().await;
    env.env.recent_opened = new_list.clone();
    Ok(())
}

#[tauri::command]
pub async fn store_state(
    new_state: HashMap<String, String>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<(), String> {
    let mut env = env_state.0.lock().await;
    env.env.state = new_state.clone();
    Ok(())
}

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

#[cfg(any(target_os = "windows", target_os = "macos"))]
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
        .map(|path| path.to_str().unwrap().replace("\\", "/").into())
}

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

#[tauri::command]
pub async fn get_current_branch(repo_path: &Path) -> Result<String, String> {
    git::branch::get_current_branch(repo_path)
        .await
        .map_err(|e| e.into())
}

#[tauri::command]
pub async fn get_reflog(repo_path: &Path, count: u32) -> Result<Vec<(String, String)>, String> {
    git::refs::get_reflog(repo_path, count)
        .await
        .map_err(|e| e.into())
}

#[tauri::command]
pub async fn get_commit_detail(repo_path: &Path, revspec: &str) -> Result<CommitDetail, String> {
    git::commit_detail::get_commit_detail(repo_path, revspec)
        .await
        .map_err(|e| e.into())
}

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

#[tauri::command]
pub async fn get_content_base64(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
) -> Result<String, String> {
    let content = git::file::get_content(repo_path, rel_path, revspec, true).await?;
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
pub async fn get_changes(repo_path: &Path, revspec: &str) -> Result<Vec<FileEntry>, String> {
    if let Some(parent) =
        git::rev_parse::rev_parse(repo_path, format!("{}~", revspec).as_str()).await?
    {
        Ok(git::diff::get_changes_between(repo_path, parent.as_str(), revspec).await?)
    } else {
        Err("Parent commit is not found".to_owned())
    }
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
pub async fn stage(repo_path: &Path, rel_paths: Vec<&str>) -> Result<(), String> {
    Ok(git::workingtree::stage(repo_path, &rel_paths).await?)
}

#[tauri::command]
pub async fn unstage(repo_path: &Path, rel_paths: Vec<&str>) -> Result<(), String> {
    Ok(git::workingtree::unstage(repo_path, &rel_paths).await?)
}

#[tauri::command]
pub async fn restore(repo_path: &Path, rel_paths: Vec<&str>) -> Result<(), String> {
    Ok(git::workingtree::restore(repo_path, &rel_paths).await?)
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
pub async fn create_branch(repo_path: &Path, options: CreateBranchOptions) -> Result<(), String> {
    Ok(git::branch::create_branch(repo_path, &options).await?)
}

#[tauri::command]
pub async fn delete_branch(repo_path: &Path, options: DeleteBranchOptions) -> Result<(), String> {
    Ok(git::branch::delete_branch(repo_path, &options).await?)
}

#[tauri::command]
pub async fn switch(repo_path: &Path, options: SwitchOptions) -> Result<(), String> {
    Ok(git::switch::switch(repo_path, &options).await?)
}

#[tauri::command]
pub async fn reset(repo_path: &Path, options: ResetOptions) -> Result<(), String> {
    Ok(git::reset::reset(repo_path, &options).await?)
}

#[tauri::command]
pub async fn get_remote_list(repo_path: &Path) -> Result<Vec<String>, String> {
    Ok(git::remote::get_remote_list(repo_path).await?)
}

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

#[tauri::command]
pub async fn yank_text<T: Runtime>(text: &str, app_handle: AppHandle<T>) -> Result<(), String> {
    app_handle
        .clipboard()
        .write_text(text)
        .map_err(|e| format!("{}", e))
}

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

#[tauri::command]
pub async fn close_pty(id: usize, pty_state: State<'_, PtyStateMutex>) -> Result<(), String> {
    let pty = pty_state.0.lock().await;
    pty.kill(PtyId(id)).await.map_err(|e| format!("{}", e))
}

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

#[tauri::command]
pub async fn get_user_info(repo_path: &Path) -> Result<GitUser, String> {
    let (name, email) = tokio::try_join!(
        git::config::get_config_value(repo_path, "user.name", false),
        git::config::get_config_value(repo_path, "user.email", false),
    )
    .map_err(|e| format!("{}", e))?;
    Ok(GitUser { name, email })
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

#[tauri::command]
pub async fn set_window_title<T: Runtime>(title: &str, window: Window<T>) -> Result<(), String> {
    window.set_title(title).map_err(|e| format!("{}", e))
}
