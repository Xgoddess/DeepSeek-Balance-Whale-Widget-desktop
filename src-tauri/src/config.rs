use crate::ledger::Ledger;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct AppConfig {
    #[serde(default)]
    pub api_key: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WidgetConfig {
    pub scale: f64,
    pub sound: bool,
    pub vol: f64,
    pub sound_set: String,
    pub peak_mode: String,
    pub bubble_on: bool,
}

impl Default for WidgetConfig {
    fn default() -> Self {
        Self {
            scale: 1.5,
            sound: true,
            vol: 0.9,
            sound_set: "duck".into(),
            peak_mode: "default".into(),
            bubble_on: true,
        }
    }
}

fn config_dir() -> PathBuf {
    let base = std::env::var("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    base.join("dsh-whale")
}

fn app_config_path() -> PathBuf {
    config_dir().join("config.json")
}
fn widget_config_path() -> PathBuf {
    config_dir().join("widget.json")
}
fn ledger_path() -> PathBuf {
    config_dir().join("usage.json")
}

fn ensure_dir() {
    let _ = fs::create_dir_all(config_dir());
}

pub fn load_app_config() -> AppConfig {
    let p = app_config_path();
    if let Ok(s) = fs::read_to_string(p) {
        if let Ok(c) = serde_json::from_str::<AppConfig>(&s) {
            return c;
        }
    }
    AppConfig::default()
}

pub fn save_app_config(cfg: &AppConfig) {
    ensure_dir();
    if let Ok(s) = serde_json::to_string_pretty(cfg) {
        let _ = fs::write(app_config_path(), s);
    }
}

pub fn load_widget_config() -> WidgetConfig {
    let p = widget_config_path();
    if let Ok(s) = fs::read_to_string(p) {
        if let Ok(c) = serde_json::from_str::<WidgetConfig>(&s) {
            return c;
        }
    }
    WidgetConfig::default()
}

pub fn save_widget_config(cfg: &WidgetConfig) {
    ensure_dir();
    if let Ok(s) = serde_json::to_string_pretty(cfg) {
        let _ = fs::write(widget_config_path(), s);
    }
}

pub fn load_ledger() -> Ledger {
    let p = ledger_path();
    if let Ok(s) = fs::read_to_string(p) {
        if let Ok(l) = serde_json::from_str::<Ledger>(&s) {
            return l;
        }
    }
    Ledger::default()
}

pub fn save_ledger(ledger: &Ledger) {
    ensure_dir();
    if let Ok(s) = serde_json::to_string_pretty(ledger) {
        let _ = fs::write(ledger_path(), s);
    }
}

