use std::{
    collections::HashMap,
    error::Error,
    path::Path,
    sync::{Arc, Mutex},
};

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

    pub fn open<
        F1: Fn(PtyId, &[u8]) + Send + 'static,
        F2: Fn(PtyId, ExitStatus) + Send + 'static,
    >(
        &mut self,
        command_line: &str,
        cwd: &Path,
        rows: u16,
        cols: u16,
        on_data: F1,
        on_exit: F2,
    ) -> Result<PtyId, Box<dyn Error>> {
        self.current_id += 1;
        let id = PtyId(self.current_id);
        let map = self.map.clone();
        let on_data_ = move |data: &[u8]| {
            on_data(id, data);
        };
        let on_exit_ = move |result: ExitStatus| {
            map.lock().unwrap().remove(&id.0);
            on_exit(id, result);
        };
        let mut pty = Pty::new();
        pty.open(command_line, cwd, rows, cols, on_data_, on_exit_)?;
        self.map.lock().unwrap().insert(id.0, pty);
        Ok(id)
    }

    pub fn write(&self, id: PtyId, data: &[u8]) -> Result<(), Box<dyn Error>> {
        if let Some(pty) = self.map.lock().unwrap().get(&id.0) {
            pty.write(data)?;
        }
        Ok(())
    }

    pub fn resize(&self, id: PtyId, rows: u16, cols: u16) -> Result<(), Box<dyn Error>> {
        if let Some(pty) = self.map.lock().unwrap().get(&id.0) {
            pty.resize(rows, cols)?;
        }
        Ok(())
    }

    pub fn kill(&self, id: PtyId) -> Result<(), Box<dyn Error>> {
        if let Some(pty) = self.map.lock().unwrap().get(&id.0) {
            pty.kill()?;
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
