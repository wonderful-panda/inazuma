use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

fn default_recent_count() -> u32 {
    10
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ConfigBase {
    #[serde(default)]
    pub font_family: FontFamily,
    #[serde(default)]
    pub font_size: FontSize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub external_diff_tool: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub interactive_shell: Option<String>,
    #[serde(default = "default_recent_count")]
    pub recent_list_count: u32,
}

impl Into<Config> for ConfigBase {
    fn into(self) -> Config {
        Config {
            font_family: self.font_family,
            font_size: self.font_size,
            external_diff_tool: self.external_diff_tool,
            interactive_shell: self.interactive_shell,
            recent_list_count: self.recent_list_count,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Config {
    pub font_family: FontFamily,
    pub font_size: FontSize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub external_diff_tool: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub interactive_shell: Option<String>,
    pub recent_list_count: u32,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            font_family: FontFamily::default(),
            font_size: FontSize::default(),
            external_diff_tool: None,
            interactive_shell: None,
            recent_list_count: 10,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FontFamily {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub standard: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub monospace: Option<String>,
}

impl Default for FontFamily {
    fn default() -> Self {
        FontFamily {
            standard: None,
            monospace: None,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Environment {
    #[serde(default)]
    pub recent_opened: Vec<String>,
    #[serde(default)]
    pub state: HashMap<String, String>,
    #[serde(default)]
    pub window_state: WindowState,
}

impl Default for Environment {
    fn default() -> Self {
        Environment {
            recent_opened: Vec::new(),
            state: HashMap::new(),
            window_state: WindowState::default(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct WindowState {
    pub width: u32,
    pub height: u32,
    pub maximized: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        WindowState {
            width: 800,
            height: 800,
            maximized: false,
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, TS)]
#[ts(export)]
pub enum FontSize {
    #[serde(rename = "medium")]
    Medium,
    #[serde(rename = "small")]
    Small,
    #[serde(rename = "x-small")]
    XSmall,
}

impl Default for FontSize {
    fn default() -> Self {
        FontSize::Medium
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Commit {
    pub id: String,
    pub parent_ids: Vec<String>,
    pub author: String,
    pub mail_address: String,
    #[ts(type = "number")]
    pub date: u64,
    pub summary: String,
}

impl Commit {
    pub fn new(
        id: &str,
        parents: &str,
        author: &str,
        mail_address: &str,
        date: u64,
        summary: &str,
    ) -> Commit {
        return Commit {
            id: id.to_string(),
            parent_ids: parents.split(' ').map(Into::into).collect(),
            author: author.to_string(),
            mail_address: mail_address.to_string(),
            date,
            summary: summary.to_string(),
        };
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FileEntry {
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub old_path: Option<String>,
    pub status_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delta: Option<FileDelta>,
}

impl FileEntry {
    pub fn new(
        path: &str,
        status_code: &str,
        old_path: Option<&str>,
        delta: Option<FileDelta>,
    ) -> FileEntry {
        FileEntry {
            path: path.to_string(),
            status_code: status_code.to_string(),
            old_path: old_path.map(|v| v.to_string()),
            delta,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export)]
pub enum WorkingTreeFileKind {
    Unstaged,
    Staged,
    Unmerged { conflict_type: String },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct WorkingTreeFileEntry {
    pub kind: WorkingTreeFileKind,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub old_path: Option<String>,
    pub status_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delta: Option<FileDelta>,
}

impl WorkingTreeFileEntry {
    pub fn ordinal(path: &str, status_code: &str, unstaged: bool) -> WorkingTreeFileEntry {
        WorkingTreeFileEntry {
            kind: if unstaged {
                WorkingTreeFileKind::Unstaged
            } else {
                WorkingTreeFileKind::Staged
            },
            path: path.to_owned(),
            old_path: None,
            status_code: status_code.to_owned(),
            delta: None,
        }
    }

    pub fn renamed_or_copied(
        path: &str,
        status_code: &str,
        old_path: &str,
        unstaged: bool,
    ) -> WorkingTreeFileEntry {
        WorkingTreeFileEntry {
            kind: if unstaged {
                WorkingTreeFileKind::Unstaged
            } else {
                WorkingTreeFileKind::Staged
            },
            path: path.to_owned(),
            old_path: Some(old_path.to_owned()),
            status_code: status_code.to_owned(),
            delta: None,
        }
    }

    pub fn unmerged(path: &str, conflict_type: &str) -> WorkingTreeFileEntry {
        WorkingTreeFileEntry {
            kind: WorkingTreeFileKind::Unmerged {
                conflict_type: conflict_type.to_owned(),
            },
            path: path.to_owned(),
            old_path: None,
            status_code: "U".to_owned(),
            delta: None,
        }
    }

    pub fn untracked(path: &str) -> WorkingTreeFileEntry {
        WorkingTreeFileEntry {
            kind: WorkingTreeFileKind::Unstaged,
            path: path.to_owned(),
            old_path: None,
            status_code: "?".to_owned(),
            delta: None,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export)]
pub enum FileDelta {
    Binary,
    Text { insertions: u32, deletions: u32 },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FileSpec {
    pub path: String,
    pub revspec: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CommitDetail {
    #[serde(flatten)]
    pub commit: Commit,
    pub body: String,
    pub files: Vec<FileEntry>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct WorkingTreeStat {
    pub files: Vec<WorkingTreeFileEntry>,
    pub parent_ids: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FileLogEntry {
    #[serde(flatten)]
    pub commit: Commit,
    #[serde(flatten)]
    pub entry: FileEntry,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export)]
pub enum Ref {
    Branch {
        id: String,
        fullname: String,
        name: String,
        current: bool,
    },
    Tag {
        id: String,
        fullname: String,
        name: String,
        tag_sha: String,
    },
    Remote {
        id: String,
        fullname: String,
        name: String,
        remote: String,
    },
    Reflog {
        id: String,
        index: usize,
        fullname: String,
        name: String,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Refs {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<String>,
    pub merge_heads: Vec<String>,
    pub refs: Vec<Ref>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase", tag = "type", content = "path")]
#[ts(export)]
pub enum LstreeData {
    Blob(String),
    Tree(String),
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct LstreeEntry {
    pub data: LstreeData,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<LstreeEntry>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct BlameEntry {
    pub id: String,
    pub line_no: Vec<u32>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Blame {
    pub blame_entries: Vec<BlameEntry>,
    pub commits: Vec<FileLogEntry>,
    pub content_base64: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase", tag = "commitType")]
#[ts(export)]
pub enum CommitOptions {
    Normal {
        message: String,
    },
    Amend {
        #[serde(skip_serializing_if = "Option::is_none")]
        message: Option<String>,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CreateBranchOptions {
    pub commit_id: String,
    pub branch_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub switch: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub force: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct DeleteBranchOptions {
    pub branch_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub force: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SwitchCreateOptions {
    pub commit_id: String,
    pub force: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SwitchOptions {
    pub branch_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub create: Option<SwitchCreateOptions>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Font {
    pub full_name: String,
    pub family_name: String,
    pub monospace: bool,
}
