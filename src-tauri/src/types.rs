use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    #[serde(default)]
    pub font_family: FontFamily,
    #[serde(default)]
    pub font_size: FontSize,
    pub external_diff_tool: Option<String>,
    #[serde(default)]
    pub interactive_shell: Option<String>,
    #[serde(default = "default_recent_list_count")]
    pub recent_list_count: u32,
}

fn default_recent_list_count() -> u32 {
    10
}

impl Default for Config {
    fn default() -> Self {
        Config {
            font_family: FontFamily::default(),
            font_size: FontSize::default(),
            external_diff_tool: None,
            interactive_shell: None,
            recent_list_count: default_recent_list_count(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
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

#[derive(Clone, Copy, Debug, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Persist {
    pub config: Config,
    pub env: Environment,
}

#[derive(JsonSchema)]
pub struct Root(Config, Environment);
