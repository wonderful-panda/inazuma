use super::{exec, GitError};
use std::fs::File;
use std::io::prelude::Write;
use std::path::Path;

pub fn get_content(repo_path: &Path, rel_path: &str, revspec: &str) -> Result<Vec<u8>, GitError> {
    let target = if revspec == "STAGED" {
        format!(":{}", rel_path)
    } else {
        format!("{}:{}", revspec, rel_path)
    };
    let args = vec!["-p", target.as_str()];
    let output = exec(repo_path, "show", &args, &[])?;
    GitError::assert_process_output("show", &output)?;

    Ok(output.stdout)
}

pub fn save_to(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
    dest_path: &str,
) -> Result<(), GitError> {
    let content = get_content(repo_path, rel_path, revspec)?;
    let mut file = File::create(dest_path)?;
    file.write_all(&content)?;
    Ok(())
}
