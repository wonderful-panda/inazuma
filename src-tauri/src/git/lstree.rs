use super::{exec, GitError};
use crate::types::*;
use regex::Regex;
use std::{collections::HashMap, path::Path};

enum EntryBase<'a> {
    Blob(&'a str),
    Tree(&'a str),
}

fn to_entry(base: &EntryBase, entries: &HashMap<&str, Vec<EntryBase>>) -> LstreeEntry {
    match base {
        EntryBase::Blob(path) => LstreeEntry {
            data: LstreeData::Blob(path.to_string()),
            children: None,
        },
        EntryBase::Tree(path) => {
            let children = entries.get(path).unwrap();
            LstreeEntry {
                data: LstreeData::Tree(path.to_string()),
                children: Some(
                    children
                        .iter()
                        .map(|child| to_entry(child, entries))
                        .collect(),
                ),
            }
        }
    }
}

fn parse_lstree_output<'a>(output: &'a str) -> Vec<LstreeEntry> {
    let regex = Regex::new(r"^[0-9]+ (blob|tree) [^ ]+\t(.*)$").unwrap();
    let mut entries: HashMap<&'a str, Vec<EntryBase<'a>>> = HashMap::new();
    entries.insert("", Vec::new());
    output.lines().for_each(|line| {
        if let Some(c) = regex.captures(line) {
            let entry_type = c.get(1).unwrap().as_str();
            let path = c.get(2).unwrap().as_str();
            let parent_path = Path::new(path)
                .parent()
                .and_then(|p| p.to_str())
                .unwrap_or("");
            let entry = if entry_type == "tree" {
                EntryBase::Tree(path)
            } else {
                EntryBase::Blob(path)
            };
            entries.entry(parent_path).or_insert(Vec::new()).push(entry);
        }
    });
    let root = to_entry(&EntryBase::Tree(""), &entries);
    if let Some(children) = root.children {
        children
    } else {
        unreachable!();
    }
}

pub async fn lstree(repo_path: &Path, sha: &str) -> Result<Vec<LstreeEntry>, GitError> {
    let args = vec!["-r", "-t", sha];
    let configs = vec!["core.quotePath=false"];
    let output = exec(repo_path, "ls-tree", &args, &configs).await?;
    GitError::assert_process_output("ls-tree", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    Ok(parse_lstree_output(stdout))
}
