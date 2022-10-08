use sha1_smol::Sha1;
use std::collections::HashMap;
use std::env;
use std::fs::{create_dir_all, remove_dir_all};
use std::path::{Path, PathBuf};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Repository {
    pub name: String,
    pub path: PathBuf,
    pub temp_dir: PathBuf,
    pub stage_file_dir: PathBuf,
}

impl Repository {
    pub fn new(path: PathBuf) -> Self {
        let name = path.file_name().unwrap().to_str().unwrap();
        let hash = Sha1::from(path.to_str().unwrap()).hexdigest();
        let temp_dir_name = format!("{}-{}", name, &hash[..8]);
        let temp_dir = env::temp_dir().join("inazuma").join(temp_dir_name);
        if !temp_dir.exists() {
            create_dir_all(&temp_dir).expect("Failed to create temp directory.");
        }
        let stage_file_dir = temp_dir.join("STAGING");
        if !stage_file_dir.exists() {
            create_dir_all(&stage_file_dir).expect("Failed to create stage file directory.");
        }
        Repository {
            name: name.into(),
            path,
            temp_dir,
            stage_file_dir,
        }
    }

    pub fn dispose(&mut self) {
        if self.temp_dir.exists() {
            if let Err(e) = remove_dir_all(&self.temp_dir) {
                warn!(
                    "Failed to remove temp directory. {}, {}",
                    self.temp_dir.to_str().unwrap(),
                    e
                );
            }
        }
    }
}

pub struct RepositoriesState {
    repositories: HashMap<String, Repository>,
}

impl RepositoriesState {
    pub fn new() -> Self {
        RepositoriesState {
            repositories: HashMap::new(),
        }
    }

    pub fn get(&self, repo_path: &Path) -> Option<&Repository> {
        self.repositories.get(repo_path.to_str().unwrap())
    }

    pub fn get_or_insert(&mut self, repo_path: &Path) -> &mut Repository {
        let key = repo_path.to_str().unwrap();
        if !self.repositories.contains_key(key) {
            self.repositories
                .insert(key.to_owned(), Repository::new(repo_path.to_path_buf()));
        }
        let repo = self.repositories.get_mut(key).unwrap();
        repo
    }

    pub fn dispose(&mut self) {
        for (_, mut repo) in self.repositories.drain() {
            repo.dispose();
        }
    }
}

pub struct RepositoriesStateMutex(pub Mutex<RepositoriesState>);

impl RepositoriesStateMutex {
    pub fn new() -> Self {
        RepositoriesStateMutex(Mutex::new(RepositoriesState::new()))
    }
}
