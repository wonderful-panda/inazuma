use notify::{Event, RecursiveMode, Watcher};
use std::{error::Error, path::Path};
use tokio::{spawn, sync::mpsc};
pub struct FsWatcher {
    watcher: Box<dyn Watcher + Send + Sync>,
}

impl FsWatcher {
    pub fn new<F: Fn(Event) + Send + 'static>(callback: F) -> Result<FsWatcher, Box<dyn Error>> {
        let (tx, mut rx) = mpsc::channel(100);
        let watcher = notify::recommended_watcher(move |res| {
            tx.blocking_send(res).expect("Failed to send event");
        })?;
        spawn(async move {
            while let Some(res) = rx.recv().await {
                match res {
                    Ok(e) => callback(e),
                    Err(e) => println!("Error: {:?}", e),
                }
            }
            println!("Finish watching");
        });

        Ok(FsWatcher {
            watcher: Box::new(watcher),
        })
    }

    pub fn watch(&mut self, path: &Path, mode: RecursiveMode) -> Result<(), Box<dyn Error>> {
        self.watcher.watch(path, mode)?;
        Ok(())
    }

    pub fn unwatch(&mut self, path: &Path) -> Result<(), Box<dyn Error>> {
        self.watcher.unwatch(path)?;
        Ok(())
    }
}
