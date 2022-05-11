use portable_pty::{
    native_pty_system, ChildKiller, CommandBuilder, ExitStatus, MasterPty, PtySize,
};
use shell_words;
use std::error::Error;
use std::path::Path;
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::Duration;
use tokio;

pub struct Pty {
    pty_master: Arc<Mutex<Option<Box<dyn MasterPty + Send>>>>,
    pty_killer: Arc<Mutex<Option<Box<dyn ChildKiller + Send>>>>,
}

impl Pty {
    pub fn new() -> Self {
        Pty {
            pty_master: Arc::new(Mutex::new(None)),
            pty_killer: Arc::new(Mutex::new(None)),
        }
    }

    pub fn open<F1: Fn(&[u8]) + Send + 'static, F2: Fn(ExitStatus) + Send + 'static>(
        &mut self,
        command_line: &str,
        cwd: &Path,
        rows: u16,
        cols: u16,
        on_data: F1,
        on_exit: F2,
    ) -> Result<(), Box<dyn Error>> {
        if self.pty_master.lock().unwrap().is_some() {
            println!("pty already opened");
            return Ok(());
        }
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
        let wait1 = Arc::new((Mutex::new(false), Condvar::new()));
        let wait2 = wait1.clone();
        tokio::task::spawn_blocking(move || {
            let mut buf = [0u8; 8162];
            {
                let (lock, cvar) = &*wait2;
                let mut ready = lock.lock().unwrap();
                *ready = true;
                cvar.notify_one();
            }
            while let Ok(len) = reader.read(&mut buf) {
                if len == 0 {
                    break;
                }
                debug!("{}", String::from_utf8(buf[0..len].to_vec()).unwrap());
                on_data(&buf[0..len]);
            }
            debug!("pty reader thread has finished");
        });

        {
            let (lock, cvar) = &*wait1;
            let mut ready = lock.lock().unwrap();
            while !*ready {
                ready = cvar.wait(ready).unwrap();
            }
        }

        *self.pty_master.lock().unwrap() = Some(pair.master);

        thread::sleep(Duration::from_millis(100)); // dirty hack to avoid lose first output from command.

        // spawn command
        let mut cmd = CommandBuilder::new(&args[0]);
        cmd.args(&args[1..]);
        cmd.cwd(cwd);
        let child = pair.slave.spawn_command(cmd)?;

        let killer = child.clone_killer();
        *self.pty_killer.lock().unwrap() = Some(killer);

        // spawn thread to watch process end.
        let pty_master = self.pty_master.clone();
        let pty_killer = self.pty_killer.clone();
        let pty_child = Mutex::new(child);
        tokio::task::spawn_blocking(move || {
            let mut child = pty_child.lock().unwrap();
            let exit_code = child.wait().unwrap();
            debug!("pty closed: {:?}", exit_code);
            on_exit(exit_code);
            if let Some(master) = pty_master.lock().unwrap().take() {
                drop(master);
            }
            if let Some(killer) = pty_killer.lock().unwrap().take() {
                drop(killer);
            }
        });
        Ok(())
    }

    pub fn write(&self, data: &[u8]) -> Result<(), Box<dyn Error>> {
        if let Some(ref master) = *self.pty_master.lock().unwrap() {
            let mut writer = master.try_clone_writer()?;
            writer.write(data)?;
        }
        Ok(())
    }

    pub fn resize(&self, rows: u16, cols: u16) -> Result<(), Box<dyn Error>> {
        if let Some(ref master) = *self.pty_master.lock().unwrap() {
            master.resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })?;
        }
        Ok(())
    }

    pub fn kill(&self) -> Result<(), Box<dyn Error>> {
        if let Some(ref mut killer) = *self.pty_killer.lock().unwrap() {
            if let Err(e) = killer.kill() {
                debug!("Maybe failed to kill pty process. {}", e);
            }
        }
        Ok(())
    }
}
