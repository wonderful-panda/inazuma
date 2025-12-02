use super::{exec, GitError};
use regex::Regex;
use std::path::Path;
use types::BlameEntry;

pub fn parse_blame_output(output: &str) -> Vec<BlameEntry> {
    let header_regex = Regex::new(r"^([a-f0-9]{40}) \d+ (\d+) (\d+)$").unwrap();
    let metadata_regex = Regex::new(r"^(author|author-time|summary) (.+)$").unwrap();
    let mut entries: Vec<BlameEntry> = Vec::new();
    let mut previous_id = "";
    output.lines().for_each(|line| {
        if let Some(c) = header_regex.captures(line) {
            let id = c.get(1).unwrap().as_str();
            let start_line: u32 = c[2].parse().unwrap();
            let line_count: u32 = c[3].parse().unwrap();
            if previous_id != id {
                previous_id = id;
                entries.push(BlameEntry {
                    id: id.to_string(),
                    summary: String::from(""),
                    author: String::from(""),
                    date: 0u64,
                    line_no: Vec::new(),
                });
            }
            let line_no = &mut entries.last_mut().unwrap().line_no;
            for n in start_line..(start_line + line_count) {
                line_no.push(n);
            }
        } else if let Some(c) = metadata_regex.captures(line) {
            let entry = entries.last_mut().unwrap();
            match &c[1] {
                "author" => {
                    entry.author = c[2].to_owned();
                }
                "author-time" => {
                    entry.date = c[2].parse::<u64>().unwrap() * 1000;
                }
                "summary" => {
                    entry.summary = c[2].to_owned();
                }
                _ => {}
            }
        }
    });
    return entries;
}

pub async fn blame(
    repo_path: &Path,
    rel_path: &str,
    sha: &str,
) -> Result<Vec<BlameEntry>, GitError> {
    let args = &[sha, "--incremental", "--", rel_path];
    let output = exec(repo_path, "blame", args, &[]).await?;
    GitError::assert_process_output("blame", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let entries = parse_blame_output(stdout);
    return Ok(entries);
}
