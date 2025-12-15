use std::{
    error::Error,
    fs::{write, File},
    io::BufReader,
    path::PathBuf,
};

use tokio::sync::Mutex;
use types::RepositoryConfig;

pub struct RepoConfigState {
    pub repo_path: Option<PathBuf>,
    pub config: RepositoryConfig,
}

impl RepoConfigState {
    pub fn new() -> RepoConfigState {
        RepoConfigState {
            config: RepositoryConfig::default(),
            repo_path: None,
        }
    }

    pub fn load(&mut self, repo_path: &str) -> Result<RepositoryConfig, Box<dyn Error>> {
        let path = PathBuf::from(repo_path).join(".git").join("inazuma.json");

        if !path.exists() {
            // Return default config if file doesn't exist
            self.config = RepositoryConfig::default();
            self.repo_path = Some(PathBuf::from(repo_path));
            return Ok(self.config.clone());
        }

        let file = File::open(&path)?;
        let config: RepositoryConfig = serde_json::from_reader(BufReader::new(file))?;

        self.repo_path = Some(PathBuf::from(repo_path));
        self.config = config.clone();

        Ok(config)
    }

    pub fn save(&mut self, new_config: RepositoryConfig) -> Result<(), Box<dyn Error>> {
        let repo_path = self
            .repo_path
            .as_ref()
            .ok_or("No repository path set")?;

        let path = repo_path.join(".git").join("inazuma.json");

        self.config = new_config;

        let json = serde_json::to_string_pretty(&self.config)?;
        write(&path, json)?;

        Ok(())
    }
}

pub struct RepoConfigStateMutex(pub Mutex<RepoConfigState>);

impl RepoConfigStateMutex {
    pub fn new() -> Self {
        RepoConfigStateMutex(Mutex::new(RepoConfigState::new()))
    }
}
