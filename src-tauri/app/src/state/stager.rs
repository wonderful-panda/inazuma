use std::collections::{HashMap, HashSet};
use std::error::Error;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::spawn;
use tokio::sync::mpsc;
use tokio::sync::mpsc::Receiver;
use tokio::sync::Mutex;
use tokio_stream::StreamExt;
use types::FileSpec;

use crate::git;
use notify::{Error as NotifyError, Event, EventKind, Watcher};

use super::repositories::Repository;

#[derive(Clone, Debug)]
pub struct TempStageFile {
    pub repo_path: PathBuf,
    pub head: String,
    pub rel_path: String,
    pub temp_path: PathBuf,
}
pub struct StagerState {
    watcher: Option<Box<dyn Watcher + Send + Sync>>,
    watch_files: Arc<Mutex<HashMap<String, TempStageFile>>>,
}

async fn update_index(f: &TempStageFile) -> Result<(), String> {
    match git::rev_parse::rev_parse(&f.repo_path, "HEAD").await? {
        Some(head) => {
            if head.eq(&f.head) {
                git::workingtree::update_index(&f.repo_path, &f.rel_path, &f.temp_path)
                    .await
                    .map_err(|e| format!("{}", e))?;
                Ok(())
            } else {
                Err(format!(
                    "Skip update-index because HEAD has been changed, {:?}",
                    f.rel_path
                ))
            }
        }
        _ => Err(format!(
            "Skip update-index because HEAD has been changed, {:?}",
            f.rel_path,
        )),
    }
}

fn handle_event<R: Runtime>(
    app_handle: AppHandle<R>,
    watch_files: Arc<Mutex<HashMap<String, TempStageFile>>>,
    mut rx: Receiver<Result<Event, NotifyError>>,
) {
    let (inner_tx, inner_rx) = mpsc::channel::<TempStageFile>(100);
    let chunk_stream = tokio_stream::wrappers::ReceiverStream::new(inner_rx)
        .chunks_timeout(100, Duration::from_millis(500));

    spawn(async move {
        tokio::pin!(chunk_stream);
        while let Some(res) = chunk_stream.next().await {
            let mut seen = HashSet::<&PathBuf>::new();
            for f in res.iter().filter(|f| seen.insert(&f.temp_path)) {
                if let Err(e) = update_index(&f).await {
                    warn!("{}", e);
                } else {
                    if let Err(e) = app_handle.emit("request_reload", &f.repo_path) {
                        error!("Failed to emit event: request_reload, {}", e);
                    }
                }
            }
        }
        println!("Finish watching");
    });

    spawn(async move {
        while let Some(res) = rx.recv().await {
            match res {
                Ok(Event {
                    kind: EventKind::Create(..) | EventKind::Modify(..),
                    paths,
                    ..
                }) => {
                    let watch_files = watch_files.lock().await;
                    for path in paths {
                        let file_name = path.file_name().unwrap().to_str().unwrap();
                        if let Some(f) = watch_files.get(file_name) {
                            if let Err(e) = inner_tx.send(f.clone()).await {
                                error!("stager: Failed to send to chunk channel, {}", e);
                            }
                        }
                    }
                }
                Err(e) => error!("stager: Failed to receive from watcher channel, {}", e),
                _ => {}
            }
        }
    });
}

impl StagerState {
    pub fn new() -> StagerState {
        StagerState {
            watcher: None,
            watch_files: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn wakeup_watcher<R: Runtime>(
        &mut self,
        app_handle: AppHandle<R>,
    ) -> Result<(), Box<dyn Error>> {
        if self.watcher.is_some() {
            return Ok(());
        }
        let (tx, rx) = mpsc::channel::<Result<Event, NotifyError>>(100);
        let watch_files_clone = Arc::clone(&self.watch_files);
        handle_event(app_handle, watch_files_clone, rx);

        let watcher = notify::recommended_watcher(move |res| {
            tx.blocking_send(res).expect("Failed to send event");
        })?;
        self.watcher = Some(Box::new(watcher));
        Ok(())
    }

    pub fn watch<R: Runtime>(
        &mut self,
        app_handle: AppHandle<R>,
        repo: &Repository,
    ) -> Result<(), Box<dyn Error>> {
        self.wakeup_watcher(app_handle)?;
        if let Some(ref mut watcher) = self.watcher {
            watcher.watch(&repo.stage_file_dir, notify::RecursiveMode::NonRecursive)?;
            debug!("watching: {:?}", repo.stage_file_dir);
        } else {
            warn!("Watcher is not awakened");
        }
        Ok(())
    }

    pub async fn unwatch(&mut self, repo: &Repository) -> Result<(), Box<dyn Error>> {
        if let Some(ref mut watcher) = self.watcher {
            watcher.unwatch(&repo.stage_file_dir)?;
            debug!("unwatch: {:?}", repo.stage_file_dir);
            let mut watch_files = self.watch_files.lock().await;
            watch_files.retain(|_, v| v.repo_path.ne(&repo.path));
            if watch_files.len() == 0 {
                drop(self.watcher.take())
            }
        } else {
            warn!("Watcher is not awakened");
        }
        Ok(())
    }

    pub async fn register_temp_stage_file(
        &self,
        repo_path: PathBuf,
        rel_path: String,
        head: String,
        temp_path: PathBuf,
    ) {
        let mut watch_files = self.watch_files.lock().await;
        let temp_name = temp_path.file_name().unwrap().to_str().unwrap().to_owned();
        watch_files.insert(
            temp_name,
            TempStageFile {
                repo_path,
                head,
                rel_path,
                temp_path,
            },
        );
    }

    pub async fn try_register_temp_stage_file(
        &self,
        repo: &Repository,
        file: &FileSpec,
        temp_path: PathBuf,
    ) -> Result<bool, Box<dyn Error>> {
        if !file.revspec.eq("STAGED") {
            return Ok(false);
        }
        let head = git::rev_parse::rev_parse(&repo.path, "HEAD").await?;
        if let Some(head) = head {
            self.register_temp_stage_file(repo.path.clone(), file.path.clone(), head, temp_path)
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
