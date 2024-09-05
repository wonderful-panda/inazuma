use std::{collections::HashMap, error::Error, path::Path, sync::Arc};
use tokio::{spawn, sync::Mutex};

use portable_pty::ExitStatus;

use crate::pty::Pty;

#[derive(Clone, Copy)]
pub struct PtyId(pub usize);

pub struct PtyState {
    current_id: usize,
    map: Arc<Mutex<HashMap<usize, Pty>>>,
}

impl PtyState {
    pub fn new() -> Self {
        PtyState {
            current_id: 0,
            map: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn open<
        F1: Fn(PtyId, &[u8]) + Send + 'static,
        F2: FnOnce(PtyId, ExitStatus) + Send + 'static,
    >(
        &mut self,
        command_line: &str,
        cwd: &Path,
        rows: u16,
        cols: u16,
        on_data: F1,
        on_exit: F2,
    ) -> Result<PtyId, Box<dyn Error + Send + Sync>> {
        self.current_id += 1;
        let id = PtyId(self.current_id);
        let map = self.map.clone();
        let on_data_ = move |data: &[u8]| {
            on_data(id, data);
        };
        let on_exit_ = move |result: ExitStatus| {
            spawn(async move {
                map.lock().await.remove(&id.0);
            });
            on_exit(id, result);
        };
        let pty = Pty::open(command_line, cwd, rows, cols, on_data_, on_exit_)?;
        self.map.lock().await.insert(id.0, pty);
        Ok(id)
    }

    pub async fn write(&self, id: PtyId, data: String) -> Result<(), Box<dyn Error>> {
        if let Some(pty) = self.map.lock().await.get(&id.0) {
            pty.write(data).await?;
        }
        Ok(())
    }

    pub async fn resize(&self, id: PtyId, rows: u16, cols: u16) -> Result<(), Box<dyn Error>> {
        if let Some(pty) = self.map.lock().await.get(&id.0) {
            pty.resize(rows, cols).await?;
        }
        Ok(())
    }

    pub async fn kill(&self, id: PtyId) -> Result<(), Box<dyn Error>> {
        if let Some(pty) = self.map.lock().await.get(&id.0) {
            pty.kill().await?;
        }
        Ok(())
    }
}

pub struct PtyStateMutex(pub Mutex<PtyState>);

impl PtyStateMutex {
    pub fn new() -> Self {
        PtyStateMutex(Mutex::new(PtyState::new()))
    }
}
