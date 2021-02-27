use std::collections::HashMap;

#[derive(Debug, PartialEq, Eq)]
pub struct Commit {
    pub id: String,
    pub parents: String,
    pub author: String,
    pub author_time: u64,
    pub summary: String,
}

impl Commit {
    pub fn new(id: &str, parents: &str, author: &str, author_time: u64, summary: &str) -> Commit {
        return Commit {
            id: id.to_string(),
            parents: parents.to_string(),
            author: author.to_string(),
            author_time,
            summary: summary.to_string(),
        };
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct FileEntry {
    pub path: String,
    pub old_path: Option<String>,
    pub status_code: String,
}

impl FileEntry {
    pub fn new(path: &str, status_code: &str, old_path: Option<&str>) -> FileEntry {
        let old_path = if let Some(ref v) = old_path {
            Some(v.to_string())
        } else {
            None
        };
        FileEntry {
            path: path.to_string(),
            status_code: status_code.to_string(),
            old_path,
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum FileDelta {
    Binary,
    Text { insertions: u32, deletions: u32 },
}

#[derive(Debug, PartialEq, Eq)]
pub struct FileStat {
    pub file: FileEntry,
    pub delta: FileDelta,
}

impl FileStat {
    pub fn new(file: FileEntry, delta: FileDelta) -> FileStat {
        FileStat { file, delta }
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct CommitDetail {
    pub commit: Commit,
    pub body: String,
    pub files: Vec<FileStat>,
}

#[derive(Debug, PartialEq, Eq)]
pub struct FileLogEntry {
    pub commit: Commit,
    pub path: String,
    pub old_path: Option<String>,
    pub status_code: String,
}

#[derive(Debug, PartialEq, Eq)]
pub struct BlameEntry {
    pub id: String,
    pub line_no: Vec<u32>,
}

#[derive(Debug)]
pub struct HeadRef {
    pub fullname: String,
    pub sha: String,
}

#[derive(Debug)]
pub struct BranchRef {
    pub fullname: String,
    pub sha: String,
    pub name: String,
    pub current: bool,
}
#[derive(Debug)]
pub struct TagRef {
    pub fullname: String,
    pub sha: String,
    pub name: String,
    pub tag_sha: String,
}
#[derive(Debug)]
pub struct RemoteRef {
    pub fullname: String,
    pub sha: String,
    pub name: String,
    pub remote: String,
}

pub struct Refs {
    pub head: Option<String>,
    pub merge_heads: Vec<String>,
    pub branches: Vec<BranchRef>,
    pub tags: Vec<TagRef>,
    pub remotes: HashMap<String, Vec<RemoteRef>>,
}
