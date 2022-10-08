use rand::{distributions::Alphanumeric, thread_rng, Rng};
use tokio::{fs::create_dir_all, process::Command};

use super::{rev_parse, GitError};
use crate::state::repositories::Repository;
use regex::Regex;
use std::{
    error::Error,
    path::{Path, PathBuf},
};
use types::FileSpec;

use super::file::save_to;

fn random_name(length: usize) -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

pub async fn prepare_diff_file(
    repo: &Repository,
    file: &FileSpec,
) -> Result<PathBuf, Box<dyn Error + Send + Sync>> {
    if file.revspec.eq("UNSTAGED") {
        return Ok(repo.path.join(&file.path));
    }
    let abs_path = if file.revspec.eq("STAGED") {
        let filename = Path::new(&file.path)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap();
        repo.stage_file_dir
            .join(format!("{}__{}", random_name(6), filename))
    } else {
        let regex = Regex::new("^[0-9a-f]{8,40}$").expect("Invalid regex");
        let revspec = if regex.is_match(&file.revspec) {
            file.revspec.clone()
        } else {
            rev_parse::rev_parse(&repo.path, &file.revspec)
                .await?
                .ok_or(GitError::ArgumentError {
                    command: "rev-parse".into(),
                    message: format!("{} is not a valid revspec", &file.revspec),
                })?
        };
        let abs_path = repo.temp_dir.join(&revspec[0..8]).join(&file.path);
        let parent = abs_path.parent().unwrap();
        if !parent.exists() {
            create_dir_all(&parent).await?;
        }
        abs_path
    };
    save_to(&repo.path, &file.path, &file.revspec, &abs_path).await?;
    Ok(abs_path)
}

fn replace_or_push(args: &mut Vec<String>, value: &str, new_value: &str) {
    for val in args.iter_mut() {
        if val.find(value).is_some() {
            *val = val.replace(value, new_value);
            return;
        }
    }
    args.push(String::from(new_value));
}

pub async fn show_external_diff(
    repo: &Repository,
    command_line: &str,
    left: &Path,
    right: &Path,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    if command_line.len() == 0 {
        return Ok(());
    }
    let mut args = shell_words::split(command_line)?;
    let program = args.remove(0);
    replace_or_push(&mut args, "${left}", left.to_str().unwrap());
    replace_or_push(&mut args, "${right}", right.to_str().unwrap());
    debug!(
        "{}, external diff: {}, {:?}",
        repo.path.display(),
        program,
        args
    );
    let mut cmd = Command::new(&program);
    cmd.args(&args);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x00000008); // DETACHED_PROCESS

    cmd.spawn()?;
    Ok(())
}
