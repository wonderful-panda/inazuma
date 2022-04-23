use tauri::State;

use crate::{
    state::{config::ConfigStateMutex, env::EnvStateMutex},
    types::{Config, Persist},
};

#[tauri::command]
pub async fn load_persist_data(
    config_state: State<'_, ConfigStateMutex>,
    env_state: State<'_, EnvStateMutex>,
) -> Result<Persist, String> {
    let config = config_state.0.lock().unwrap();
    let env = env_state.0.lock().unwrap();
    Ok(Persist {
        config: config.config.clone(),
        env: env.env.clone(),
    })
}

#[tauri::command]
pub async fn save_config(
    new_config: Config,
    config_state: State<'_, ConfigStateMutex>,
) -> Result<(), String> {
    let mut config = config_state.0.lock().unwrap();
    if let Err(e) = config.save(new_config) {
        warn!("Failed to save config, {}", e);
        Err(format!("Failed to save config, {}", e))
    } else {
        Ok(())
    }
}
