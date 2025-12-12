use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

fn default_recent_count() -> u32 {
    10
}

fn default_use_gravatar() -> bool {
    true
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, TS)]
#[ts(export)]
pub enum LogLevel {
    #[serde(rename = "off")]
    Off,
    #[serde(rename = "error")]
    Error,
    #[serde(rename = "warn")]
    Warn,
    #[serde(rename = "info")]
    Info,
    #[serde(rename = "debug")]
    Debug,
    #[serde(rename = "trace")]
    Trace,
}

impl Default for LogLevel {
    fn default() -> Self {
        LogLevel::Info
    }
}

impl LogLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Off => "off",
            LogLevel::Error => "error",
            LogLevel::Warn => "warn",
            LogLevel::Info => "info",
            LogLevel::Debug => "debug",
            LogLevel::Trace => "trace",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CustomCommand {
    pub name: String,
    pub description: String,
    pub command_line: String,
    pub confirm_before_execute: bool,
    pub use_builtin_terminal: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ConfigBase {
    #[serde(default)]
    pub font_family: FontFamily,
    #[serde(default)]
    pub font_size: FontSize,
    #[ts(optional)]
    pub external_diff_tool: Option<String>,
    #[ts(optional)]
    pub interactive_shell: Option<String>,
    #[serde(default = "default_recent_count")]
    pub recent_list_count: u32,
    #[serde(default)]
    pub avatar_shape: AvatarShape,
    #[serde(default = "default_use_gravatar")]
    pub use_gravatar: bool,
    #[serde(default)]
    pub log_level: LogLevel,
    #[serde(default)]
    pub custom_commands: Vec<CustomCommand>,
}

impl Into<Config> for ConfigBase {
    fn into(self) -> Config {
        Config {
            font_family: self.font_family,
            font_size: self.font_size,
            external_diff_tool: self.external_diff_tool,
            interactive_shell: self.interactive_shell,
            recent_list_count: self.recent_list_count,
            avatar_shape: self.avatar_shape,
            use_gravatar: self.use_gravatar,
            log_level: self.log_level,
            custom_commands: self.custom_commands,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Config {
    pub font_family: FontFamily,
    pub font_size: FontSize,
    #[ts(optional)]
    pub external_diff_tool: Option<String>,
    #[ts(optional)]
    pub interactive_shell: Option<String>,
    pub recent_list_count: u32,
    pub avatar_shape: AvatarShape,
    pub use_gravatar: bool,
    pub log_level: LogLevel,
    #[serde(default)]
    pub custom_commands: Vec<CustomCommand>,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            font_family: FontFamily::default(),
            font_size: FontSize::default(),
            external_diff_tool: None,
            interactive_shell: None,
            recent_list_count: default_recent_count(),
            avatar_shape: AvatarShape::default(),
            use_gravatar: default_use_gravatar(),
            log_level: LogLevel::default(),
            custom_commands: Vec::new(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct FontFamily {
    #[ts(optional)]
    pub standard: Option<String>,
    #[ts(optional)]
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

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, TS)]
#[ts(export)]
pub enum AvatarShape {
    #[serde(rename = "square")]
    Square,
    #[serde(rename = "circle")]
    Circle,
}

impl Default for AvatarShape {
    fn default() -> Self {
        AvatarShape::Square
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
    #[ts(optional)]
    pub old_path: Option<String>,
    pub status_code: String,
    #[ts(optional)]
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
    #[ts(optional)]
    pub old_path: Option<String>,
    pub status_code: String,
    #[ts(optional)]
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
    #[ts(optional)]
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
    #[ts(optional)]
    pub children: Option<Vec<LstreeEntry>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct BlameEntry {
    pub id: String,
    pub author: String,
    pub summary: String,
    #[ts(type = "number")]
    pub date: u64,
    pub line_no: Vec<u32>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Blame {
    pub blame_entries: Vec<BlameEntry>,
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
        #[ts(optional)]
        message: Option<String>,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CreateBranchOptions {
    pub commit_id: String,
    pub branch_name: String,
    #[ts(optional)]
    pub switch: Option<bool>,
    #[ts(optional)]
    pub force: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct DeleteBranchOptions {
    pub branch_name: String,
    #[ts(optional)]
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
    #[ts(optional)]
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

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct GitUser {
    pub name: String,
    pub email: String,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum ResetMode {
    Soft,
    Mixed,
    Hard,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ResetOptions {
    pub mode: ResetMode,
    pub commit_id: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_custom_command_serialization() {
        let cmd = CustomCommand {
            name: "test-cmd".to_string(),
            description: "Test command".to_string(),
            command_line: "echo hello".to_string(),
            confirm_before_execute: true,
            use_builtin_terminal: false,
        };

        let json = serde_json::to_string(&cmd).unwrap();
        let deserialized: CustomCommand = serde_json::from_str(&json).unwrap();

        assert_eq!(cmd, deserialized);
    }

    #[test]
    fn test_custom_command_camel_case() {
        let cmd = CustomCommand {
            name: "test".to_string(),
            description: "desc".to_string(),
            command_line: "cmd".to_string(),
            confirm_before_execute: true,
            use_builtin_terminal: true,
        };

        let json = serde_json::to_string(&cmd).unwrap();
        assert!(json.contains("\"confirmBeforeExecute\""));
        assert!(json.contains("\"useBuiltinTerminal\""));
        assert!(json.contains("\"commandLine\""));
    }

    #[test]
    fn test_config_with_custom_commands_default() {
        let config = Config::default();
        assert_eq!(config.custom_commands.len(), 0);
    }

    #[test]
    fn test_config_with_custom_commands_serialization() {
        let cmd = CustomCommand {
            name: "git-log".to_string(),
            description: "Show git log".to_string(),
            command_line: "git log --oneline".to_string(),
            confirm_before_execute: false,
            use_builtin_terminal: true,
        };

        let mut config = Config::default();
        config.custom_commands.push(cmd);

        let json = serde_json::to_string(&config).unwrap();
        let deserialized: Config = serde_json::from_str(&json).unwrap();

        assert_eq!(config, deserialized);
        assert_eq!(deserialized.custom_commands.len(), 1);
        assert_eq!(deserialized.custom_commands[0].name, "git-log");
    }
}
