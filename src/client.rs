//! Qwen API Client implementation in Rust

use anyhow::Result;
use futures_util::StreamExt;
use reqwest::{
    header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE},
    Client,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct QwenClient {
    client: Arc<Client>,
    base_url: String,
    auth_token: String,
    cookie: String,
}

impl QwenClient {
    pub fn new(auth_token: String, cookie: String, base_url: Option<String>) -> Result<Self> {
        let base_url = base_url.unwrap_or_else(|| "https://chat.qwen.ai".to_string());
        let client = Client::builder().build()?;

        Ok(QwenClient {
            client: Arc::new(client),
            base_url,
            auth_token,
            cookie,
        })
    }

    fn build_headers(&self) -> Result<HeaderMap> {
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", self.auth_token))?,
        );
        headers.insert("Cookie", HeaderValue::from_str(&self.cookie)?);
        headers.insert("User-Agent", HeaderValue::from_static("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"));
        headers.insert("Host", HeaderValue::from_static("chat.qwen.ai"));
        headers.insert("Origin", HeaderValue::from_static("https://chat.qwen.ai"));
        Ok(headers)
    }

    // Non-streaming chat completions
    pub async fn create(
        &self,
        request: crate::types::ChatCompletionRequest,
    ) -> Result<crate::types::ChatResponse> {
        // Handle tool logic for non-streaming
        if !request.tools.is_empty() {
            let last_message = request.messages.last().cloned().unwrap();
            let tools_as_string = serde_json::to_string_pretty(&request.tools)?;

            // 1. Action Selection Step
            let action_selection_prompt_content = format!("You are a helpful assistant with tool calling capabilities. When a user asks a question, you can choose to use a tool to help answer it. If you choose to use a tool, respond with 'Yes'. If you choose not to use a tool, respond with 'No'.\n\nAvailable tools:\n{}", tools_as_string);
            let action_selection_messages = vec![
                crate::types::ChatMessage {
                    role: crate::types::MessageRole::System,
                    content: serde_json::Value::String(action_selection_prompt_content),
                    tool_calls: None,
                },
                last_message.clone(),
            ];
            let should_use_tool_response = self
                .get_raw_chat_response(crate::types::ChatCompletionRequest {
                    messages: action_selection_messages,
                    model: request.model.clone(),
                    temperature: None,
                    max_tokens: None,
                    stream: false,
                    tools: vec![], // No tools for action selection
                })
                .await
                .unwrap_or_else(|_| "No".to_string()); // Default to "No" if there's an error

            if should_use_tool_response.to_lowercase() == "yes" {
                // 2. Tool Generation Step
                let tool_generation_prompt_content = format!("You are a helpful assistant with tool calling capabilities. When a user asks a question, you can choose to use a tool to help answer it. Generate a tool call in JSON format.\n\nAvailable tools:\n{}", tools_as_string);
                let tool_generation_messages = vec![
                    crate::types::ChatMessage {
                        role: crate::types::MessageRole::System,
                        content: serde_json::Value::String(tool_generation_prompt_content),
                        tool_calls: None,
                    },
                    last_message,
                ];
                let tool_response = self
                    .get_raw_chat_response(crate::types::ChatCompletionRequest {
                        messages: tool_generation_messages,
                        model: request.model.clone(),
                        temperature: None,
                        max_tokens: None,
                        stream: false,
                        tools: vec![], // No tools for tool generation
                    })
                    .await
                    .unwrap_or_else(|_| "".to_string()); // Default to empty string if there's an error

                // Try to parse tool response as JSON
                if let Ok(tool_json) =
                    serde_json::from_str::<crate::types::FunctionCall>(&tool_response)
                {
                    // Successfully parsed tool JSON, return as tool_calls
                    return Ok(crate::types::ChatResponse {
                        choices: vec![crate::types::Choice {
                            message: crate::types::ChatMessage {
                                role: crate::types::MessageRole::Assistant,
                                content: serde_json::Value::String("".to_string()),
                                tool_calls: Some(vec![crate::types::ToolCall {
                                    id: format!(
                                        "call_{}",
                                        std::time::SystemTime::now()
                                            .duration_since(std::time::UNIX_EPOCH)
                                            .unwrap()
                                            .as_millis()
                                    ),
                                    call_type: "function".to_string(),
                                    function: tool_json,
                                }]),
                            },
                        }],
                    });
                } else {
                    // If JSON parsing fails, proceed as a normal chat
                    println!("Warning: Tool generation response was not valid JSON, falling back to regular chat: {}", tool_response);
                }
            }
        }

        // Default behavior: Regular non-streaming chat completion
        self.make_api_call_non_stream(request).await
    }

    // Internal method for actual non-streaming API call.
    async fn make_api_call_non_stream(
        &self,
        request: crate::types::ChatCompletionRequest,
    ) -> Result<crate::types::ChatResponse> {
        let url = format!("{}/api/chat/completions", self.base_url);

        // Convert ChatMessage to InternalPayloadMessage
        let mut payload_messages = Vec::new();
        for msg in &request.messages {
            let final_content = if msg.content.is_array() {
                // It's an array of ContentBlock
                match serde_json::from_value::<Vec<crate::types::ContentBlock>>(msg.content.clone())
                {
                    Ok(content_blocks) => {
                        let mut internal_blocks = Vec::new();

                        for block in content_blocks {
                            match block.block_type.as_str() {
                                "text" => {
                                    match serde_json::from_value::<crate::types::TextBlock>(
                                        serde_json::Value::Object(
                                            block.data.clone().into_iter().collect(),
                                        ),
                                    ) {
                                        Ok(text_block) => {
                                            internal_blocks.push(
                                                crate::types::InternalPayloadContentBlock {
                                                    block_type: text_block.block_type,
                                                    text: Some(text_block.text),
                                                    image: None,
                                                    audio: None,
                                                },
                                            );
                                        }
                                        Err(_) => {
                                            // Handle parsing error
                                            println!("Warning: Failed to parse text block");
                                        }
                                    }
                                }
                                "image" => {
                                    match serde_json::from_value::<crate::types::ImageBlock>(
                                        serde_json::Value::Object(
                                            block.data.clone().into_iter().collect(),
                                        ),
                                    ) {
                                        Ok(image_block) => {
                                            internal_blocks.push(
                                                crate::types::InternalPayloadContentBlock {
                                                    block_type: image_block.block_type,
                                                    text: None,
                                                    image: image_block.url,
                                                    audio: None,
                                                },
                                            );
                                        }
                                        Err(_) => {
                                            // Handle parsing error
                                            println!("Warning: Failed to parse image block");
                                        }
                                    }
                                }
                                "audio" => {
                                    match serde_json::from_value::<crate::types::AudioBlock>(
                                        serde_json::Value::Object(
                                            block.data.clone().into_iter().collect(),
                                        ),
                                    ) {
                                        Ok(audio_block) => {
                                            internal_blocks.push(
                                                crate::types::InternalPayloadContentBlock {
                                                    block_type: audio_block.block_type,
                                                    text: None,
                                                    image: None,
                                                    audio: audio_block.url,
                                                },
                                            );
                                        }
                                        Err(_) => {
                                            // Handle parsing error
                                            println!("Warning: Failed to parse audio block");
                                        }
                                    }
                                }
                                _ => {
                                    internal_blocks.push(
                                        crate::types::InternalPayloadContentBlock {
                                            block_type: block.block_type,
                                            text: None,
                                            image: None,
                                            audio: None,
                                        },
                                    );
                                }
                            }
                        }

                        serde_json::Value::Array(
                            internal_blocks
                                .into_iter()
                                .filter_map(|b| serde_json::to_value(b).ok())
                                .collect(),
                        )
                    }
                    Err(_) => {
                        // If parsing fails, return the original content
                        msg.content.clone()
                    }
                }
            } else {
                // It's a string
                msg.content.clone()
            };

            let payload_message = crate::types::InternalPayloadMessage {
                role: msg.role.clone(),
                content: final_content,
                chat_type: "t2t".to_string(),
                feature_config: crate::types::FeatureConfig {
                    thinking_enabled: false,
                    thinking_budget: 0,
                    output_schema: None,
                },
                extra: std::collections::HashMap::new(),
            };

            payload_messages.push(payload_message);
        }

        // Build payload
        let payload = serde_json::json!({
            "model": request.model,
            "messages": payload_messages,
            "stream": false,
            "incremental_output": false,
            "temperature": request.temperature,
            // "max_tokens": request.max_tokens, // Disabled for now
        });

        let headers = self.build_headers()?;

        let resp = self
            .client
            .post(&url)
            .headers(headers)
            .json(&payload)
            .send()
            .await?
            .error_for_status()?;

        let value: crate::types::ChatResponse = resp.json().await?;
        Ok(value)
    }

    // Internal method to get raw chat response (non-streaming).
    async fn get_raw_chat_response(
        &self,
        request: crate::types::ChatCompletionRequest,
    ) -> Result<String> {
        let response = self.make_api_call_non_stream(request).await?;

        if response.choices.is_empty() {
            return Ok(String::new());
        }

        let choice = &response.choices[0];
        let content = &choice.message.content;

        // Check if content is a string
        if let Some(s) = content.as_str() {
            return Ok(s.to_string());
        }

        // Assume it's an array of ContentBlock
        match serde_json::from_value::<Vec<crate::types::ContentBlock>>(content.clone()) {
            Ok(content_blocks) => {
                let mut result_content = String::new();
                for block in content_blocks {
                    match block.block_type.as_str() {
                        "text" => {
                            match serde_json::from_value::<crate::types::TextBlock>(
                                serde_json::Value::Object(block.data.clone().into_iter().collect()),
                            ) {
                                Ok(text_block) => {
                                    result_content.push_str(&text_block.text);
                                }
                                Err(_) => {
                                    // Handle parsing error
                                    println!("Warning: Failed to parse text block");
                                }
                            }
                        }
                        "image" => {
                            match serde_json::from_value::<crate::types::ImageBlock>(
                                serde_json::Value::Object(block.data.clone().into_iter().collect()),
                            ) {
                                Ok(image_block) => {
                                    if let Some(url) = image_block.url {
                                        result_content.push_str(&format!("![image]({})", url));
                                    }
                                }
                                Err(_) => {
                                    // Handle parsing error
                                    println!("Warning: Failed to parse image block");
                                }
                            }
                        }
                        "audio" => {
                            match serde_json::from_value::<crate::types::AudioBlock>(
                                serde_json::Value::Object(block.data.clone().into_iter().collect()),
                            ) {
                                Ok(audio_block) => {
                                    if let Some(url) = audio_block.url {
                                        result_content.push_str(&format!("![audio]({})", url));
                                    }
                                }
                                Err(_) => {
                                    // Handle parsing error
                                    println!("Warning: Failed to parse audio block");
                                }
                            }
                        }
                        _ => {}
                    }
                }
                Ok(result_content)
            }
            Err(_) => {
                // If parsing fails, return empty string
                Ok(String::new())
            }
        }
    }

    // Streaming chat completions
    pub async fn stream(
        &self,
        request: crate::types::ChatCompletionRequest,
    ) -> Result<(
        tokio::sync::mpsc::Receiver<crate::types::ChatResponseStream>,
        tokio::sync::oneshot::Receiver<()>,
    )> {
        // Handle tool logic for streaming
        if !request.tools.is_empty() {
            let last_message = request.messages.last().cloned().unwrap();
            let tools_as_string = serde_json::to_string_pretty(&request.tools)?;

            // 1. Action Selection Step
            let action_selection_prompt_content = format!("You are a helpful assistant with tool calling capabilities. When a user asks a question, you can choose to use a tool to help answer it. If you choose to use a tool, respond with 'Yes'. If you choose not to use a tool, respond with 'No'.\n\nAvailable tools:\n{}", tools_as_string);
            let action_selection_messages = vec![
                crate::types::ChatMessage {
                    role: crate::types::MessageRole::System,
                    content: serde_json::Value::String(action_selection_prompt_content),
                    tool_calls: None,
                },
                last_message.clone(),
            ];
            let should_use_tool_response = self
                .get_raw_chat_response(crate::types::ChatCompletionRequest {
                    messages: action_selection_messages,
                    model: request.model.clone(),
                    temperature: None,
                    max_tokens: None,
                    stream: false,
                    tools: vec![], // No tools for action selection
                })
                .await
                .unwrap_or_else(|_| "No".to_string()); // Default to "No" if there's an error

            if should_use_tool_response.to_lowercase() == "yes" {
                // 2. Tool Generation Step
                let tool_generation_prompt_content = format!("You are a helpful assistant with tool calling capabilities. When a user asks a question, you can choose to use a tool to help answer it. Generate a tool call in JSON format.\n\nAvailable tools:\n{}", tools_as_string);
                let tool_generation_messages = vec![
                    crate::types::ChatMessage {
                        role: crate::types::MessageRole::System,
                        content: serde_json::Value::String(tool_generation_prompt_content),
                        tool_calls: None,
                    },
                    last_message,
                ];
                let tool_response = self
                    .get_raw_chat_response(crate::types::ChatCompletionRequest {
                        messages: tool_generation_messages,
                        model: request.model.clone(),
                        temperature: None,
                        max_tokens: None,
                        stream: false,
                        tools: vec![], // No tools for tool generation
                    })
                    .await
                    .unwrap_or_else(|_| "".to_string()); // Default to empty string if there's an error

                // Try to parse tool response as JSON
                if let Ok(tool_json) =
                    serde_json::from_str::<crate::types::FunctionCall>(&tool_response)
                {
                    // Successfully parsed tool JSON, return as tool_calls
                    let (stream_tx, stream_rx) = tokio::sync::mpsc::channel(1);
                    let (close_tx, close_rx) = tokio::sync::oneshot::channel();

                    let tool_call_response = crate::types::ChatResponseStream {
                        choices: vec![crate::types::ChoiceStream {
                            delta: crate::types::Delta {
                                role: Some(crate::types::MessageRole::Assistant),
                                content: None,
                                tool_calls: Some(vec![crate::types::ToolCall {
                                    id: format!(
                                        "call_{}",
                                        std::time::SystemTime::now()
                                            .duration_since(std::time::UNIX_EPOCH)
                                            .unwrap()
                                            .as_millis()
                                    ),
                                    call_type: "function".to_string(),
                                    function: tool_json,
                                }]),
                            },
                        }],
                    };

                    tokio::spawn(async move {
                        let _ = stream_tx.send(tool_call_response).await;
                        let _ = close_tx.send(());
                    });

                    return Ok((stream_rx, close_rx));
                } else {
                    // If JSON parsing fails, proceed as a normal chat
                    println!("Warning: Tool generation response was not valid JSON, falling back to regular chat: {}", tool_response);
                }
            }
        }

        // Default behavior: Regular streaming chat completion
        self.make_api_call_stream(request).await
    }

    // Internal method for actual streaming API call.
    async fn make_api_call_stream(
        &self,
        request: crate::types::ChatCompletionRequest,
    ) -> Result<(
        tokio::sync::mpsc::Receiver<crate::types::ChatResponseStream>,
        tokio::sync::oneshot::Receiver<()>,
    )> {
        let url = format!("{}/api/chat/completions", self.base_url);
        let (stream_tx, stream_rx) = tokio::sync::mpsc::channel(100);
        let (close_tx, close_rx) = tokio::sync::oneshot::channel();

        // Convert ChatMessage to InternalPayloadMessage
        let mut payload_messages = Vec::new();
        for msg in &request.messages {
            let final_content = if msg.content.is_array() {
                // It's an array of ContentBlock
                match serde_json::from_value::<Vec<crate::types::ContentBlock>>(msg.content.clone())
                {
                    Ok(content_blocks) => {
                        let mut internal_blocks = Vec::new();

                        for block in content_blocks {
                            match block.block_type.as_str() {
                                "text" => {
                                    match serde_json::from_value::<crate::types::TextBlock>(
                                        serde_json::Value::Object(
                                            block.data.clone().into_iter().collect(),
                                        ),
                                    ) {
                                        Ok(text_block) => {
                                            internal_blocks.push(
                                                crate::types::InternalPayloadContentBlock {
                                                    block_type: text_block.block_type,
                                                    text: Some(text_block.text),
                                                    image: None,
                                                    audio: None,
                                                },
                                            );
                                        }
                                        Err(_) => {
                                            // Handle parsing error
                                            println!("Warning: Failed to parse text block");
                                        }
                                    }
                                }
                                "image" => {
                                    match serde_json::from_value::<crate::types::ImageBlock>(
                                        serde_json::Value::Object(
                                            block.data.clone().into_iter().collect(),
                                        ),
                                    ) {
                                        Ok(image_block) => {
                                            internal_blocks.push(
                                                crate::types::InternalPayloadContentBlock {
                                                    block_type: image_block.block_type,
                                                    text: None,
                                                    image: image_block.url,
                                                    audio: None,
                                                },
                                            );
                                        }
                                        Err(_) => {
                                            // Handle parsing error
                                            println!("Warning: Failed to parse image block");
                                        }
                                    }
                                }
                                "audio" => {
                                    match serde_json::from_value::<crate::types::AudioBlock>(
                                        serde_json::Value::Object(
                                            block.data.clone().into_iter().collect(),
                                        ),
                                    ) {
                                        Ok(audio_block) => {
                                            internal_blocks.push(
                                                crate::types::InternalPayloadContentBlock {
                                                    block_type: audio_block.block_type,
                                                    text: None,
                                                    image: None,
                                                    audio: audio_block.url,
                                                },
                                            );
                                        }
                                        Err(_) => {
                                            // Handle parsing error
                                            println!("Warning: Failed to parse audio block");
                                        }
                                    }
                                }
                                _ => {
                                    internal_blocks.push(
                                        crate::types::InternalPayloadContentBlock {
                                            block_type: block.block_type,
                                            text: None,
                                            image: None,
                                            audio: None,
                                        },
                                    );
                                }
                            }
                        }

                        serde_json::Value::Array(
                            internal_blocks
                                .into_iter()
                                .filter_map(|b| serde_json::to_value(b).ok())
                                .collect(),
                        )
                    }
                    Err(_) => {
                        // If parsing fails, return the original content
                        msg.content.clone()
                    }
                }
            } else {
                // It's a string
                msg.content.clone()
            };

            let payload_message = crate::types::InternalPayloadMessage {
                role: msg.role.clone(),
                content: final_content,
                chat_type: "t2t".to_string(),
                feature_config: crate::types::FeatureConfig {
                    thinking_enabled: false,
                    thinking_budget: 0,
                    output_schema: None,
                },
                extra: std::collections::HashMap::new(),
            };

            payload_messages.push(payload_message);
        }

        // Build payload
        let payload = serde_json::json!({
            "model": request.model,
            "messages": payload_messages,
            "stream": true,
            "incremental_output": true,
            "temperature": request.temperature,
            // "max_tokens": request.max_tokens, // Disabled for now
        });

        let headers = self.build_headers()?;

        let client = self.client.clone();
        tokio::spawn(async move {
            let resp = client
                .post(&url)
                .headers(headers)
                .json(&payload)
                .send()
                .await;

            match resp {
                Ok(resp) => {
                    let resp = resp.error_for_status();
                    match resp {
                        Ok(resp) => {
                            let mut stream = resp.bytes_stream();
                            while let Some(chunk) = stream.next().await {
                                match chunk {
                                    Ok(chunk) => {
                                        let chunk_str = String::from_utf8_lossy(&chunk);
                                        let lines: Vec<&str> = chunk_str.lines().collect();
                                        for line in lines {
                                            if line.starts_with("data:") {
                                                let json_str = &line[5..];
                                                match serde_json::from_str::<
                                                    crate::types::ChatResponseStream,
                                                >(
                                                    json_str
                                                ) {
                                                    Ok(chat_response_stream) => {
                                                        if stream_tx
                                                            .send(chat_response_stream)
                                                            .await
                                                            .is_err()
                                                        {
                                                            // Receiver dropped
                                                            break;
                                                        }
                                                    }
                                                    Err(_e) => {
                                                        // Ignore parsing errors, as per original TS code
                                                        // println!("Error parsing JSON: {}", e);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        println!("Error reading chunk: {}", e);
                                        break;
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            println!("Error in response: {}", e);
                        }
                    }
                }
                Err(e) => {
                    println!("Error sending request: {}", e);
                }
            }

            let _ = close_tx.send(());
        });

        Ok((stream_rx, close_rx))
    }
}
