use std::sync::{Arc, Condvar, Mutex};

#[derive(Clone)]
pub struct Wait(Arc<(Mutex<bool>, Condvar)>);
impl Wait {
    pub fn wait(&mut self) {
        let (m, cond) = &*self.0;
        let mut finished = m.lock().unwrap();
        while !*finished {
            finished = cond.wait(finished).unwrap();
        }
    }
}

pub struct Notify(Arc<(Mutex<bool>, Condvar)>);
impl Notify {
    pub fn notify(&mut self) {
        let (m, cond) = &*self.0;
        let mut finished = m.lock().unwrap();
        *finished = true;
        cond.notify_all();
    }
}

pub fn get_sync() -> (Wait, Notify) {
    let w = Arc::new((Mutex::new(false), Condvar::new()));
    let w2 = Arc::clone(&w);
    (Wait(w), Notify(w2))
}
