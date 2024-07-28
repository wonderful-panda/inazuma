use sha2::{Digest, Sha256};
use std::error::Error;
use std::sync::Arc;
use std::{collections::HashMap, time::Duration};
use tauri_plugin_http::reqwest::{Client, ClientBuilder, StatusCode};
use tokio::spawn;
use tokio::sync::broadcast;
use tokio::sync::mpsc;
use tokio::sync::Mutex;

pub enum Avatar {
    NotReady(broadcast::Sender<()>),
    Ready(Arc<Vec<u8>>),
    NotFound,
    HttpError(StatusCode),
    Error(String),
}

pub struct AvatarsState {
    tx: Mutex<Option<mpsc::Sender<String>>>,
    pub avatars: Arc<Mutex<HashMap<String, Avatar>>>,
}

fn get_mail_address_hash(mail_address: &str) -> String {
    let hash = Sha256::digest(mail_address.trim().to_lowercase().to_owned().into_bytes());
    hash.into_iter()
        .map(|b| format!("{:02x}", b))
        .collect::<String>()
}

async fn get_avatar_from_gravatar(client: &Client, mail_address: &str) -> Avatar {
    let hash = get_mail_address_hash(mail_address);
    let url = format!("https://gravatar.com/avatar/{}?d=404&size=48", hash);
    match client.get(url).timeout(Duration::from_secs(3)).build() {
        Ok(request) => match client.execute(request).await {
            Ok(response) => match response.status() {
                StatusCode::OK => match response.bytes().await {
                    Ok(bytes) => Avatar::Ready(Arc::new(bytes.into())),
                    Err(error) => Avatar::Error(error.to_string()),
                },
                StatusCode::NOT_FOUND => Avatar::NotFound,
                _ => Avatar::HttpError(response.status()),
            },
            Err(e) => Avatar::Error(e.to_string()),
        },
        Err(e) => Avatar::Error(e.to_string()),
    }
}

impl AvatarsState {
    pub fn new() -> AvatarsState {
        AvatarsState {
            tx: Mutex::new(None),
            avatars: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn serve(&self) -> Result<(), Box<dyn Error>> {
        let mut tx = self.tx.lock().await;
        if tx.is_some() {
            warn!("Avatars is already serving.");
            return Ok(());
        }
        let (tx_, mut rx) = mpsc::channel::<String>(100);
        *tx = Some(tx_);
        drop(tx);

        let avatars = Arc::clone(&self.avatars);
        let client = ClientBuilder::new()
            .connect_timeout(Duration::from_secs(3))
            .build()?;
        spawn(async move {
            while let Some(mail) = rx.recv().await {
                debug!("received: {}", mail);
                if let Some(avatar) = avatars.lock().await.get(&mail) {
                    if !matches!(avatar, Avatar::NotReady(..)) {
                        continue;
                    }
                }
                // release lock of avatars during `get_avatar_from_gravatar`
                let avatar = get_avatar_from_gravatar(&client, &mail).await;
                let mut avatars = avatars.lock().await;
                if let Some(old_value) = avatars.remove(&mail) {
                    avatars.insert(mail, avatar);
                    if let Avatar::NotReady(tx) = old_value {
                        tx.send(()).unwrap();
                    }
                }
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
        });
        Ok(())
    }

    pub async fn stop(&self) {
        let mut tx = self.tx.lock().await;
        if tx.is_none() {
            warn!("Avatars is not running.");
        } else {
            drop(tx.take());
        }
        let mut avatars = self.avatars.lock().await;
        avatars.drain();
    }

    pub async fn fetch_avatar(&self, mail: String) -> Result<Option<Arc<Vec<u8>>>, Box<dyn Error>> {
        if self.tx.lock().await.is_none() {
            warn!("Avatars is not serving");
            return Ok(None);
        }
        let mut avatars = self.avatars.lock().await;
        if let Some(avatar) = avatars.get(&mail) {
            match avatar {
                Avatar::NotReady(tx2) => {
                    let mut rx2 = tx2.subscribe();
                    drop(avatars);
                    if rx2.recv().await.is_ok() {
                        Ok(self.get_avatar_data_from_cache(&mail).await)
                    } else {
                        Ok(None)
                    }
                }
                Avatar::Ready(data) => Ok(Some(Arc::clone(data))),
                _ => Ok(None),
            }
        } else {
            let (tx2, mut rx2) = broadcast::channel::<()>(16);
            avatars.insert(String::clone(&mail), Avatar::NotReady(tx2));
            drop(avatars);
            self.push_request(String::clone(&mail)).await?;
            if rx2.recv().await.is_ok() {
                Ok(self.get_avatar_data_from_cache(&mail).await)
            } else {
                Ok(None)
            }
        }
    }

    async fn push_request(&self, mail: String) -> Result<(), Box<dyn Error>> {
        let tx = self.tx.lock().await;
        if tx.is_none() {
            panic!("Avatars is not serving.");
        }
        tx.as_ref().unwrap().send(mail).await?;
        Ok(())
    }

    async fn get_avatar_data_from_cache(&self, mail: &str) -> Option<Arc<Vec<u8>>> {
        let avatars = self.avatars.lock().await;
        let avatar = avatars.get(mail).unwrap();
        match avatar {
            Avatar::Ready(data) => Some(Arc::clone(data)),
            _ => None,
        }
    }
}

pub struct AvatarsStateMutex(pub Mutex<AvatarsState>);

impl AvatarsStateMutex {
    pub fn new() -> AvatarsStateMutex {
        AvatarsStateMutex(Mutex::new(AvatarsState::new()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn get_mail_address_hash_test() {
        let hash = get_mail_address_hash("iwata0303@gmail.com");
        assert_eq!(
            hash,
            "e2dd2bf8ba1a7b139707a0126571504ba264c545b7264e5d0dde79351e1120b6"
        );
    }
}
