use std::collections::HashMap;
use std::error::Error;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::spawn;
use tokio::sync::mpsc;
use tokio::sync::Mutex;
use types::FileSpec;

use crate::git;
use notify::{Error as NotifyError, Event, EventKind, Watcher};

use super::repositories::Repository;

#[derive(Clone, Debug)]
pub struct TempStageFile {
    pub repo_path: PathBuf,
    pub head: String,
    pub rel_path: String,
}
pub struct StagerState {
    watcher: Option<Box<dyn Watcher + Send + Sync>>,
    watch_files: Arc<Mutex<HashMap<String, TempStageFile>>>,
}

async fn watch_callback(watch_files: &Arc<Mutex<HashMap<String, TempStageFile>>>, e: Event) {
    match e.kind {
        EventKind::Create(..) | EventKind::Modify(..) => {
            let watch_files = watch_files.lock().await;
            let mut targets = HashMap::<PathBuf, TempStageFile>::new();
            for path in e.paths {
                let file_name = path.file_name().unwrap().to_str().unwrap();
                if let Some(f) = watch_files.get(file_name) {
                    targets.entry(path.clone()).or_insert(f.clone());
                }
            }
            drop(watch_files);
            for (path, f) in targets {
                if let Ok(Some(head)) = git::rev_parse::rev_parse(&f.repo_path, "HEAD").await {
                    if !head.eq(&f.head) {
                        warn!(
                            "Skip update-index because HEAD has been changed, {:?}",
                            path
                        );
                        continue;
                    }
                    if let Err(e) =
                        git::workingtree::update_index(&f.repo_path, &f.rel_path, &path).await
                    {
                        error!("{}", e);
                    }
                }
            }
        }
        _ => {}
    }
}

impl StagerState {
    pub fn new() -> StagerState {
        StagerState {
            watcher: None,
            watch_files: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn wakeup_watcher(&mut self) -> Result<(), Box<dyn Error>> {
        if self.watcher.is_some() {
            warn!("Watcher is already awakened");
            return Ok(());
        }
        let (tx, mut rx) = mpsc::channel::<Result<Event, NotifyError>>(100);
        let watch_files_clone = Arc::clone(&self.watch_files);
        spawn(async move {
            while let Some(res) = rx.recv().await {
                match res {
                    Ok(e) => watch_callback(&watch_files_clone, e).await,
                    Err(e) => println!("Error: {:?}", e),
                }
            }
            println!("Finish watching");
        });

        let watcher = notify::recommended_watcher(move |res| {
            println!("{:?}", res);
            tx.blocking_send(res).expect("Failed to send event");
        })?;
        self.watcher = Some(Box::new(watcher));
        Ok(())
    }

    pub fn watch(&mut self, repo: &Repository) -> Result<(), Box<dyn Error>> {
        if let Some(ref mut watcher) = self.watcher {
            watcher.watch(&repo.stage_file_dir, notify::RecursiveMode::NonRecursive)?;
            debug!("watching: {:?}", repo.stage_file_dir);
        } else {
            warn!("Watcher is not awakened");
        }
        Ok(())
    }

    pub fn unwatch(&mut self, repo: &Repository) -> Result<(), Box<dyn Error>> {
        if let Some(ref mut watcher) = self.watcher {
            watcher.unwatch(&repo.stage_file_dir)?;
            debug!("unwatch: {:?}", repo.stage_file_dir);
        } else {
            warn!("Watcher is not awakened");
        }
        Ok(())
    }

    pub async fn register_temp_stage_file(
        &self,
        repo_path: &Path,
        rel_path: &str,
        head: &str,
        temp_name: &str,
    ) {
        let mut watch_files = self.watch_files.lock().await;
        watch_files.insert(
            temp_name.to_owned(),
            TempStageFile {
                repo_path: repo_path.to_owned(),
                head: head.to_owned(),
                rel_path: rel_path.to_owned(),
            },
        );
    }

    pub async fn try_register_temp_stage_file(
        &self,
        repo: &Repository,
        file: &FileSpec,
        temp_path: &Path,
    ) -> Result<bool, Box<dyn Error>> {
        if !file.revspec.eq("STAGED") {
            return Ok(false);
        }
        let head = git::rev_parse::rev_parse(&repo.path, "HEAD").await?;
        if let Some(head) = head {
            println!("{}", head);
            let temp_name = temp_path.file_name().unwrap().to_str().unwrap();
            self.register_temp_stage_file(&repo.path, &file.path, &head, temp_name)
                .await;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn dispose(&mut self) {
        let mut watch_files = self.watch_files.lock().await;
        watch_files.drain();
        drop(self.watcher.take());
    }
}

pub struct StagerStateMutex(pub Mutex<StagerState>);

impl StagerStateMutex {
    pub fn new() -> StagerStateMutex {
        StagerStateMutex(Mutex::new(StagerState::new()))
    }
}
