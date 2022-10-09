use std::{
    error::Error,
    fs::{write, File},
    io::BufReader,
    path::PathBuf,
};

use tokio::sync::Mutex;
use types::Config;

pub struct ConfigState {
    config_file_path: Option<PathBuf>,
    pub config: Config,
}

impl ConfigState {
    pub fn new() -> ConfigState {
        ConfigState {
            config: Config::default(),
            config_file_path: None,
        }
    }

    pub fn from_path(path: PathBuf) -> ConfigState {
        ConfigState {
            config: Config::default(),
            config_file_path: Some(path),
        }
    }

    pub fn load(&mut self) -> Result<(), Box<dyn Error>> {
        self.config = Config::default();
        if let Some(ref path) = self.config_file_path {
            if path.exists() {
                let file = File::open(path)?;
                self.config = serde_json::from_reader(BufReader::new(file))?;
            }
        }
        Ok(())
    }
    pub fn save(&mut self, new_config: Config) -> Result<(), Box<dyn Error>> {
        self.config = new_config;
        if let Some(ref path) = self.config_file_path {
            let json = serde_json::to_string_pretty(&self.config)?;
            write(path, json)?;
        }
        Ok(())
    }
}

pub struct ConfigStateMutex(pub Mutex<ConfigState>);

impl ConfigStateMutex {
    pub fn new() -> Self {
        ConfigStateMutex(Mutex::new(ConfigState::new()))
    }
}
