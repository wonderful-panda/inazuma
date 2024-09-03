#[macro_use]
extern crate log;
extern crate env_logger;

mod avatar_protocol_handler;
pub mod commands;
pub mod git;
pub mod pty;
pub mod state;
pub mod sync;

use state::avatars::AvatarsState;
use state::config::{ConfigState, ConfigStateMutex};
use state::env::{EnvState, EnvStateMutex};
use state::pty::PtyStateMutex;
use state::repositories::RepositoriesStateMutex;
use state::stager::StagerStateMutex;
use std::{error::Error, fs::create_dir_all};
use sync::get_sync;
use tauri::{
    generate_handler, App, AppHandle, Manager, RunEvent, Runtime, WebviewUrl, WebviewWindowBuilder,
    WindowEvent,
};
use tauri_plugin_clipboard_manager;
use tauri_plugin_dialog;
use tauri_plugin_http;
use tokio::spawn;
use types::WindowState;

fn setup<T: Runtime>(app: &mut App<T>) -> Result<(), Box<dyn Error>> {
    let app_dir = app.path().app_config_dir().unwrap();
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

    let app_handle = AppHandle::clone(app.handle());
    spawn(async move {
        let avatars = app_handle.state::<AvatarsState>();
        if let Err(e) = avatars.serve().await {
            warn!("Failed to serve avatars, {}", e);
        }
        let state = app_handle.state::<ConfigStateMutex>();
        *state.0.lock().await = config_state;

        let state = app_handle.state::<EnvStateMutex>();
        *state.0.lock().await = env_state;

        notify.notify();
    });
    if width == 0 || height == 0 {
        let def = WindowState::default();
        width = def.width;
        height = def.height;
    }

    wait.wait();

    let win = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("Inazuma")
        .resizable(true)
        .fullscreen(false)
        .inner_size(width.into(), height.into())
        .maximized(maximized)
        .visible(false)
        .drag_and_drop(false)
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .manage(EnvStateMutex::new())
        .manage(ConfigStateMutex::new())
        .manage(PtyStateMutex::new())
        .manage(RepositoriesStateMutex::new())
        .manage(StagerStateMutex::new())
        .manage(AvatarsState::new())
        .invoke_handler(generate_handler![
            commands::open_repository,
            commands::close_repository,
            commands::fetch_history,
            commands::get_reflog,
            commands::commit,
            commands::create_branch,
            commands::delete_branch,
            commands::get_current_branch,
            commands::get_blame,
            commands::get_changes,
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
            commands::reset,
            commands::unstage,
            commands::restore,
            commands::show_external_diff,
            commands::get_user_info,
            commands::yank_text,
            commands::open_pty,
            commands::write_pty,
            commands::resize_pty,
            commands::close_pty,
            commands::find_repository_root,
            commands::set_window_title,
        ])
        .setup(|app| setup(app))
        .register_asynchronous_uri_scheme_protocol("avatar", move |app, request, responder| {
            let app = AppHandle::clone(&app);
            avatar_protocol_handler::handle_request(app, request, responder);
        })
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
                    let window = app_handle_clone.get_webview_window("main").unwrap();
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

                let state = app_handle_clone.state::<AvatarsState>();
                state.stop().await;

                notify.notify();
            });
            wait.wait();
        }
        _ => {}
    })
}
