use std::{
    error::Error,
    fs::{write, File},
    io::BufReader,
    path::PathBuf,
};

use tauri::{PhysicalSize, Runtime, Size, WebviewWindow};
use tokio::sync::Mutex;
use types::{Environment, WindowState};

pub struct EnvState {
    env_file_path: Option<PathBuf>,
    pub env: Environment,
}

impl EnvState {
    pub fn new() -> EnvState {
        EnvState {
            env: Environment::default(),
            env_file_path: None,
        }
    }

    pub fn from_path(path: PathBuf) -> EnvState {
        EnvState {
            env: Environment::default(),
            env_file_path: Some(path),
        }
    }

    pub fn load(&mut self) -> Result<(), Box<dyn Error>> {
        self.env = Environment::default();
        if let Some(ref path) = self.env_file_path {
            if path.exists() {
                let file = File::open(path)?;
                self.env = serde_json::from_reader(BufReader::new(file))?;
            }
        }
        Ok(())
    }

    pub fn restore_window_state<T: Runtime>(
        &self,
        window: &WebviewWindow<T>,
    ) -> Result<(), Box<dyn Error>> {
        let WindowState {
            width,
            height,
            maximized,
        } = self.env.window_state;
        window.set_size(Size::Physical(PhysicalSize { width, height }))?;
        if maximized {
            window.maximize()?;
        }

        Ok(())
    }

    pub fn store_window_state<T: Runtime>(
        &mut self,
        window: &WebviewWindow<T>,
    ) -> Result<(), Box<dyn Error>> {
        let maximized = window.is_maximized()?;
        self.env.window_state.maximized = maximized;
        if !maximized {
            let PhysicalSize { width, height } = window.inner_size()?;
            if 0 < width && 0 < height {
                self.env.window_state.width = width;
                self.env.window_state.height = height;
            }
        }
        Ok(())
    }

    pub fn save(&self) -> Result<(), Box<dyn Error>> {
        if let Some(ref path) = self.env_file_path {
            let json = serde_json::to_string_pretty(&self.env)?;
            write(path, json)?;
        }
        Ok(())
    }
}

pub struct EnvStateMutex(pub Mutex<EnvState>);

impl EnvStateMutex {
    pub fn new() -> Self {
        EnvStateMutex(Mutex::new(EnvState::new()))
    }
}
