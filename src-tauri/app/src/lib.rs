#[macro_use]
extern crate log;
extern crate env_logger;

pub mod commands;
pub mod git;
pub mod pty;
pub mod state;
pub mod sync;

use state::config::{ConfigState, ConfigStateMutex};
use state::env::{EnvState, EnvStateMutex};
use state::pty::PtyStateMutex;
use state::repositories::RepositoriesStateMutex;
use state::stager::StagerStateMutex;
use std::{error::Error, fs::create_dir_all};
use sync::get_sync;
use tauri::{
    generate_handler, App, AppHandle, Manager, RunEvent, Runtime, WindowBuilder, WindowEvent,
    WindowUrl,
};
use tokio::spawn;
use types::WindowState;

fn setup<T: Runtime>(app: &mut App<T>) -> Result<(), Box<dyn Error>> {
    let app_dir = app.path_resolver().app_config_dir().unwrap();
    if !app_dir.exists() {
        if let Err(e) = create_dir_all(&app_dir) {
            error!(
                "Failed to create application directory, {:?}, {}",
                &app_dir, e
            );
            return Err(e.into());
        }
    }
    let config_path = app_dir.join("config.json");
    let mut config_state = ConfigState::from_path(config_path);
    if let Err(e) = config_state.load() {
        warn!("Failed to load config file, {}", e);
    };

    let env_path = app_dir.join(".environment.json");
    let mut env_state = EnvState::from_path(env_path);
    if let Err(e) = env_state.load() {
        warn!("Failed to load env file, {}", e);
    };
    let WindowState {
        mut width,
        mut height,
        maximized,
    } = env_state.env.window_state;

    let (mut wait, mut notify) = get_sync();
    let app_handle = app.app_handle();
    spawn(async move {
        let state = app_handle.state::<ConfigStateMutex>();
        *state.0.lock().await = config_state;

        let state = app_handle.state::<EnvStateMutex>();
        *state.0.lock().await = env_state;

        let state = app_handle.state::<StagerStateMutex>();
        let mut stager = state.0.lock().await;
        if let Err(e) = stager.wakeup_watcher(app_handle.clone()) {
            warn!("Failed to awake watcher, {}", e);
        }
        notify.notify();
    });
    if width == 0 || height == 0 {
        let def = WindowState::default();
        width = def.width;
        height = def.height;
    }

    wait.wait();

    let win = WindowBuilder::new(app, "main", WindowUrl::App("index.html".into()))
        .title("Inazuma")
        .resizable(true)
        .fullscreen(false)
        .inner_size(width.into(), height.into())
        .maximized(maximized)
        .visible(false)
        .build();
    match win {
        Ok(win) => {
            if let Err(e) = win.show() {
                error!("Failed to show main window, {}", e);
                return Err(e.into());
            }
        }
        Err(e) => {
            error!("Failed to create main window, {}", e);
            return Err(e.into());
        }
    }
    Ok(())
}

pub fn run() {
    let app = tauri::Builder::default()
        .manage(EnvStateMutex::new())
        .manage(ConfigStateMutex::new())
        .manage(PtyStateMutex::new())
        .manage(RepositoriesStateMutex::new())
        .manage(StagerStateMutex::new())
        .invoke_handler(generate_handler![
            commands::open_repository,
            commands::close_repository,
            commands::fetch_history,
            commands::commit,
            commands::create_branch,
            commands::get_blame,
            commands::get_changes_between,
            commands::get_commit_detail,
            commands::get_content_base64,
            commands::get_system_fonts,
            commands::get_tree,
            commands::get_workingtree_stat,
            commands::get_workingtree_udiff_base64,
            commands::load_persist_data,
            commands::save_config,
            commands::show_folder_selector,
            commands::stage,
            commands::store_recent_opened,
            commands::store_state,
            commands::switch,
            commands::unstage,
            commands::restore,
            commands::show_external_diff,
            commands::yank_text,
            commands::open_pty,
            commands::write_pty,
            commands::resize_pty,
            commands::close_pty,
            commands::find_repository_root,
            commands::set_window_title,
        ])
        .setup(|app| setup(app))
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, e| match e {
        RunEvent::WindowEvent {
            label,
            event: WindowEvent::Resized(..),
            ..
        } => {
            if label.eq("main") {
                let app_handle_clone = AppHandle::clone(&app_handle);
                spawn(async move {
                    let window = app_handle_clone.get_window("main").unwrap();
                    let mutex = app_handle_clone.state::<EnvStateMutex>();
                    let mut env_state = mutex.0.lock().await;
                    if let Err(e) = env_state.store_window_state(&window) {
                        warn!("Failed to store window state. {}", e);
                    }
                });
            }
        }
        RunEvent::Exit { .. } => {
            let (mut wait, mut notify) = get_sync();
            let app_handle_clone = AppHandle::clone(&app_handle);
            spawn(async move {
                let env_state = app_handle_clone.state::<EnvStateMutex>();
                let env_state = env_state.0.lock().await;
                if let Err(e) = env_state.save() {
                    warn!("Failed to write env file, {}", e);
                }

                let state = app_handle_clone.state::<StagerStateMutex>();
                let mut stager = state.0.lock().await;
                stager.dispose().await;

                let state = app_handle_clone.state::<RepositoriesStateMutex>();
                let mut repositories = state.0.lock().await;
                repositories.dispose();

                notify.notify();
            });
            wait.wait();
        }
        _ => {}
    })
}
