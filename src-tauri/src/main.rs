#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate env_logger;
extern crate log;

fn main() {
    env_logger::init();
    app::run()
}
