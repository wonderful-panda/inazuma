use portable_pty::{
    native_pty_system, ChildKiller, CommandBuilder, ExitStatus, MasterPty, PtySize,
};
use shell_words;
use std::error::Error;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tokio;

use crate::sync::get_sync;

pub struct Pty {
    pty_master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    pty_killer: Arc<Mutex<Box<dyn ChildKiller + Send>>>,
}

impl Pty {
    pub fn open<F1: Fn(&[u8]) + Send + 'static, F2: Fn(ExitStatus) + Send + 'static>(
        command_line: &str,
        cwd: &Path,
        rows: u16,
        cols: u16,
        on_data: F1,
        on_exit: F2,
    ) -> Result<Pty, Box<dyn Error>> {
        let args = shell_words::split(command_line)?;
        let pty_system = native_pty_system();
        let pair = pty_system.openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        // spawn reader thread.
        let mut reader = pair.master.try_clone_reader()?;
        let (mut wait, mut notify) = get_sync();
        tokio::task::spawn_blocking(move || {
            let mut buf = [0u8; 8162];
            notify.notify();
            while let Ok(len) = reader.read(&mut buf) {
                if len == 0 {
                    break;
                }
                on_data(&buf[0..len]);
            }
            debug!("pty reader thread has finished");
        });
        wait.wait();

        thread::sleep(Duration::from_millis(100)); // dirty hack to avoid lose first output from command.

        // spawn command
        let mut cmd = CommandBuilder::new(&args[0]);
        cmd.args(&args[1..]);
        cmd.cwd(cwd);
        let mut child = pair.slave.spawn_command(cmd)?;

        let killer = child.clone_killer();

        // spawn thread to watch process end.
        tokio::task::spawn_blocking(move || {
            let exit_code = child.wait().unwrap();
            debug!("pty closed: {:?}", exit_code);
            on_exit(exit_code);
        });
        Ok(Pty {
            pty_master: Arc::new(Mutex::new(pair.master)),
            pty_killer: Arc::new(Mutex::new(killer)),
        })
    }

    pub fn write(&self, data: &[u8]) -> Result<(), Box<dyn Error>> {
        let master = self.pty_master.lock().unwrap();
        let mut writer = master.try_clone_writer()?;
        writer.write(data)?;
        Ok(())
    }

    pub fn resize(&self, rows: u16, cols: u16) -> Result<(), Box<dyn Error>> {
        let master = self.pty_master.lock().unwrap();
        master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;
        Ok(())
    }

    pub fn kill(&self) -> Result<(), Box<dyn Error>> {
        let mut killer = self.pty_killer.lock().unwrap();
        if let Err(e) = killer.kill() {
            debug!("Maybe failed to kill pty process. {}", e);
        }
        Ok(())
    }
}
