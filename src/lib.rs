//! Qwen API Client Library
//! 
//! This library provides a Rust client for the Qwen Chat API,
//! supporting both streaming and non-streaming chat completions,
//! file uploads, and tool usage.

pub mod types;
pub mod client;

pub use client::QwenClient;
pub use types::*;

/// Model aliases mapping human-friendly names to model IDs
pub mod model_aliases {
    use std::collections::HashMap;
    use std::sync::OnceLock;

    static MODEL_ALIASES: OnceLock<HashMap<&'static str, &'static str>> = OnceLock::new();

    pub fn get_model_aliases() -> &'static HashMap<&'static str, &'static str> {
        MODEL_ALIASES.get_or_init(|| {
            let mut m = HashMap::new();
            m.insert("Jennie", "qwen3-235b-a22b");
            m.insert("Lisa", "qwen3-30b-a3b");
            m.insert("Rosseane", "qwen3-32b");
            m.insert("Cichu", "qwen-max-latest");
            m.insert("Chaelisa", "qwq-32b");
            m.insert("Blinque", "qwen2.5-omni-7b");
            m.insert("Blackpink", "qvq-72b-preview-0310");
            m.insert("Jarvis", "qwen2.5-vl-32b-instruct");
            m.insert("Black Mamba", "qwen2.5-14b-instruct-1m");
            m.insert("Milea", "qwen2.5-coder-32b-instruct");
            m.insert("Dilan", "qwen2.5-72b-instruct");
            m.insert("Qwen3-Coder", "qwen3-coder-plus");
            m
        })
    }

    /// Resolve model alias to actual model ID
    pub fn resolve_model_alias(alias: &str) -> &str {
        get_model_aliases().get(alias).unwrap_or(&alias)
    }
}