use portable_pty::{native_pty_system, CommandBuilder, ExitStatus, PtyPair, PtySize};
use shell_words;
use std::error::Error;
use std::io::Write;
use std::path::Path;
use std::thread::sleep;
use std::time::Duration;
use tokio::sync::mpsc::{channel, Sender};
use tokio::{spawn, task::spawn_blocking};

#[derive(Debug, Clone)]
pub enum Message {
    Resize { rows: u16, cols: u16 },
    Kill,
    Write(String),
}

#[derive(Clone)]
pub struct Pty {
    pub tx: Sender<Message>,
}

impl Pty {
    pub fn open<F1: Fn(&[u8]) + Send + 'static, F2: FnOnce(ExitStatus) + Send + 'static>(
        command_line: &str,
        cwd: &Path,
        rows: u16,
        cols: u16,
        on_data: F1,
        on_exit: F2,
    ) -> Result<Pty, Box<dyn Error>> {
        let args = shell_words::split(command_line)?;
        let pty_system = native_pty_system();
        let PtyPair { master, slave } = pty_system.openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        // spawn reader thread.
        let mut reader = master.try_clone_reader()?;
        spawn_blocking(move || {
            let mut buf = [0u8; 8162];
            while let Ok(len) = reader.read(&mut buf) {
                if len == 0 {
                    break;
                }
                on_data(&buf[0..len]);
            }
            debug!("pty reader thread has finished");
        });

        sleep(Duration::from_millis(100)); // dirty hack to avoid lose first output from command.

        let (tx, mut rx) = channel(100);
        // spawn command
        let mut cmd = CommandBuilder::new(&args[0]);
        cmd.args(&args[1..]);
        cmd.cwd(cwd);
        let mut child = slave.spawn_command(cmd)?;

        let mut killer = child.clone_killer();
        let mut writer = master.try_clone_writer()?;

        spawn(async move {
            while let Some(m) = rx.recv().await {
                match m {
                    Message::Resize { rows, cols } => {
                        let size = PtySize {
                            rows,
                            cols,
                            pixel_width: 0,
                            pixel_height: 0,
                        };
                        if let Err(e) = master.resize(size) {
                            error!("Failed to resize pty, {}", e);
                        }
                    }
                    Message::Kill => {
                        if let Err(e) = killer.kill() {
                            debug!("Maybe failed to kill pty process, {}", e);
                        }
                    }
                    Message::Write(data) => {
                        if let Err(e) = writer.write(data.as_bytes()) {
                            error!("Failed to write to pty, {}", e);
                        }
                    }
                }
            }
            debug!("pty: internal channel has closed");
        });

        // spawn thread to watch process end.
        spawn_blocking(move || {
            let exit_code = child.wait().unwrap();
            debug!("pty closed: {:?}", exit_code);
            on_exit(exit_code);
        });
        Ok(Pty { tx })
    }

    pub async fn write(&self, data: String) -> Result<(), Box<dyn Error>> {
        self.tx.send(Message::Write(data)).await?;
        Ok(())
    }

    pub async fn resize(&self, rows: u16, cols: u16) -> Result<(), Box<dyn Error>> {
        self.tx.send(Message::Resize { rows, cols }).await?;
        Ok(())
    }

    pub async fn kill(&self) -> Result<(), Box<dyn Error>> {
        self.tx.send(Message::Kill).await?;
        Ok(())
    }
}
