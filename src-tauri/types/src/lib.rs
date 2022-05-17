use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub font_family: FontFamily,
    pub font_size: FontSize,
    pub external_diff_tool: Option<String>,
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FontFamily {
    pub standard: Option<String>,
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
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

#[derive(Clone, Copy, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum FontSize {
    Medium,
    Small,
    XSmall,
}

impl Default for FontSize {
    fn default() -> Self {
        FontSize::Medium
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Commit {
    pub id: String,
    pub parent_ids: Vec<String>,
    pub author: String,
    pub date: u64,
    pub summary: String,
}

impl Commit {
    pub fn new(id: &str, parents: &str, author: &str, date: u64, summary: &str) -> Commit {
        return Commit {
            id: id.to_string(),
            parent_ids: parents.split(' ').map(Into::into).collect(),
            author: author.to_string(),
            date,
            summary: summary.to_string(),
        };
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FileEntry {
    pub path: String,
    pub old_path: Option<String>,
    pub status_code: String,
    pub delta: Option<FileDelta>,
}

impl FileEntry {
    pub fn new(
        path: &str,
        status_code: &str,
        old_path: Option<&str>,
        delta: Option<FileDelta>,
    ) -> FileEntry {
        let old_path = if let Some(ref v) = old_path {
            Some(v.to_string())
        } else {
            None
        };
        FileEntry {
            path: path.to_string(),
            status_code: status_code.to_string(),
            old_path,
            delta,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields, tag = "type")]
pub enum FileDelta {
    Binary,
    Text { insertions: u32, deletions: u32 },
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FileSpec {
    pub path: String,
    pub revspec: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CommitDetail {
    #[serde(flatten)]
    pub commit: Commit,
    pub body: String,
    pub files: Vec<FileEntry>,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkingTreeStat {
    pub unstaged_files: Vec<FileEntry>,
    pub staged_files: Vec<FileEntry>,
    pub parent_ids: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FileLogEntry {
    #[serde(flatten)]
    pub commit: Commit,
    #[serde(flatten)]
    pub entry: FileEntry,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields, tag = "type")]
pub enum Ref {
    #[serde(rename_all = "camelCase")]
    Branch {
        id: String,
        fullname: String,
        name: String,
        current: bool,
    },
    #[serde(rename_all = "camelCase")]
    Tag {
        id: String,
        fullname: String,
        name: String,
        tag_sha: String,
    },
    #[serde(rename_all = "camelCase")]
    Remote {
        id: String,
        fullname: String,
        name: String,
        remote: String,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Refs {
    pub head: Option<String>,
    pub merge_heads: Vec<String>,
    pub refs: Vec<Ref>,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(
    rename_all = "camelCase",
    deny_unknown_fields,
    tag = "type",
    content = "path"
)]
pub enum LstreeData {
    Blob(String),
    Tree(String),
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LstreeEntry {
    pub data: LstreeData,
    pub children: Option<Vec<LstreeEntry>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BlameEntry {
    pub id: String,
    pub line_no: Vec<u32>,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Blame {
    pub blame_entries: Vec<BlameEntry>,
    pub commits: Vec<FileLogEntry>,
    pub content_base64: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields, tag = "commitType")]
pub enum CommitOptions {
    Normal { message: String },
    Amend { message: Option<String> },
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, PartialEq, Eq, Hash)]
pub struct Font {
    pub full_name: String,
    pub family_name: String,
    pub monospace: bool,
}

#[derive(JsonSchema)]
pub struct Root(
    Blame,
    BlameEntry,
    Commit,
    CommitDetail,
    CommitOptions,
    Config,
    Environment,
    FileLogEntry,
    FileSpec,
    LstreeEntry,
    Refs,
    WorkingTreeStat,
    Font,
);
