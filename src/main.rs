//! Main entry point for the Qwen CLI application.

use axum::{
    extract::State,
    http,
    response::{IntoResponse, Sse},
    routing::{get, post},
    Json, Router,
};
use clap::Parser;
use dotenvy::dotenv;
use futures_util::stream::StreamExt;
use qwen_api::ChatMessage;
use qwen_api::MessageRole;
use qwen_api::{model_aliases::get_model_aliases, types::ChatCompletionRequest, QwenClient};
use serde_json::{json, Value as JsonValue};
use std::convert::Infallible;
use std::env;
use std::sync::Arc;
use tokio_stream::wrappers::ReceiverStream;
type SharedClient = Arc<QwenClient>;

/// CLI arguments for the Qwen CLI application
#[derive(Parser, Debug)]
#[clap(name = "qwen-cli", about = "Qwen CLI application", version)]
struct CliArgs {
    /// Command to run
    #[clap(subcommand)]
    command: Option<Command>,
}

/// Available commands
#[derive(clap::Subcommand, Debug)]
enum Command {
    /// Start the HTTP server
    Serve {
        /// Host to bind the server to
        #[clap(long, default_value = "0.0.0.0")]
        host: String,

        /// Port to bind the server to
        #[clap(long, default_value = "8001")]
        port: u16,
    },

    /// Run a streaming chat example
    Stream,

    /// Upload functionality (stub)
    Upload,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let auth_token =
        env::var("QWEN_AUTH_TOKEN").expect("Please set QWEN_AUTH_TOKEN environment variable.");
    let cookie = env::var("QWEN_COOKIE").expect("Please set QWEN_COOKIE environment variable.");
    // println!("{}",auth_token);
    // println!("{}",cookie);
    let client =
        Arc::new(QwenClient::new(auth_token, cookie, None).expect("Failed to create QwenClient"));

    let cli_args = CliArgs::parse();

    match &cli_args.command {
        Some(Command::Serve { host, port }) => {
            println!(
                "Starting OpenAI-compatible REST API server on {}:{} ...",
                host, port
            );
            start_http_server(client, host.clone(), *port).await;
        }
        Some(Command::Stream) => {
            run_stream_example(client).await;
        }
        Some(Command::Upload) => {
            println!("Stub: upload CLI feature");
        }
        None => {
            println!("No command specified. Running default chat example.");
            run_chat_example(client).await;
        }
    }
    Ok(())
}

async fn run_chat_example(client: SharedClient) {
    let message_content = "What is the capital of France?";
    let _role = "user";
    let request = ChatCompletionRequest {
        model: "qwen-max-latest".to_string(), // Ganti dengan model yang diinginkan
        messages: vec![ChatMessage {
            role: MessageRole::User,
            content: serde_json::Value::String(message_content.to_string()),
            tool_calls: None,
        }],
        temperature: None,
        max_tokens: None,
        stream: false,
        tools: vec![],
    };

    println!("Sending chat completion request...");
    match client.create(request).await {
        Ok(response) => {
            if let Some(choice) = response.choices.get(0) {
                let content = choice.message.content.as_str().unwrap_or("No content");
                println!("Assistant: {}", content);
            } else {
                println!("No response from assistant.");
            }
        }
        Err(e) => {
            println!("Error creating chat completion: {:?}", e);
        }
    }
}

async fn start_http_server(client: SharedClient, host: String, port: u16) {
    let app = Router::new()
        .route("/v1/chat/completions", post(post_chat_completions))
        .route("/v1/models", get(get_models))
        .with_state(client);

    let addr = format!("{}:{}", host, port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/// POST /v1/chat/completions -- forward to Qwen API and translate response to OpenAI format
async fn post_chat_completions(
    State(client): State<SharedClient>,
    Json(req): Json<ChatCompletionRequest>,
) -> Result<impl IntoResponse, (http::StatusCode, Json<serde_json::Value>)> {
    if req.stream {
        // Streaming response
        match client.stream(req).await {
            Ok((stream_rx, _close_rx)) => {
                // Convert the receiver to a stream
                let stream = ReceiverStream::new(stream_rx);

                // Map the stream to SSE events
                let sse_stream = stream.map(|response| {
                    // Convert ChatResponseStream to OpenAI-like SSE format
                    let mut choices = Vec::new();
                    for (i, choice) in response.choices.iter().enumerate() {
                        // Check if this is the final choice with a finish reason
                        let finish_reason = if let Some(tool_calls) = &choice.delta.tool_calls {
                            if !tool_calls.is_empty() {
                                Some("tool_calls")
                            } else {
                                None
                            }
                        } else if choice.delta.content.is_none()
                            || choice.delta.content.as_deref() == Some("")
                        {
                            Some("stop")
                        } else {
                            None
                        };

                        // Determine the role for this delta
                        let role_str = if let Some(role) = &choice.delta.role {
                            match role {
                                qwen_api::MessageRole::System => "system",
                                qwen_api::MessageRole::Developer => "developer",
                                qwen_api::MessageRole::User => "user",
                                qwen_api::MessageRole::Assistant => "assistant",
                                qwen_api::MessageRole::Function => "function",
                                qwen_api::MessageRole::Tool => "tool",
                            }
                        } else {
                            "assistant"
                        };

                        choices.push(json!({
                            "index": i,
                            "delta": {
                                "role": role_str,
                                "content": choice.delta.content.clone().unwrap_or_default(),
                            },
                            "finish_reason": match finish_reason {
                                Some(reason) => serde_json::Value::String(reason.to_string()),
                                None => serde_json::Value::Null,
                            },
                        }));
                    }

                    let data = json!({
                        "id": "chatcmpl-123",
                        "object": "chat.completion.chunk",
                        "created": std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs(),
                        "model": "qwen-max-latest", // Use the actual model from request if available
                        "choices": choices,
                    });

                    Ok::<_, Infallible>(
                        axum::response::sse::Event::default()
                            .json_data(data)
                            .map_err(|e| {
                                eprintln!("Error serializing SSE data: {}", e);
                            })
                            .unwrap_or(axum::response::sse::Event::default()),
                    )
                });

                Ok(Sse::new(sse_stream).into_response())
            }
            Err(e) => {
                let err_json = json!({
                    "error": format!("{:?}", e)
                });
                Err((http::StatusCode::BAD_GATEWAY, Json(err_json)))
            }
        }
    } else {
        // Non-streaming response (default)
        match client.create(req.clone()).await {
            Ok(qwen_resp) => {
                let mut choices_json = Vec::new();
                for (i, c) in qwen_resp.choices.iter().enumerate() {
                    let string_content = c
                        .message
                        .content
                        .as_str()
                        .map(|s| s.to_owned())
                        .unwrap_or_else(|| format!("{:?}", c.message.content));
                    // For non-streaming, we'll set finish_reason to "stop" as default
                    // In a more complete implementation, we'd check for tool calls, etc.
                    let finish_reason = if let Some(tool_calls) = &c.message.tool_calls {
                        if !tool_calls.is_empty() {
                            "tool_calls"
                        } else {
                            "stop"
                        }
                    } else {
                        "stop"
                    };

                    choices_json.push(json!({
                        "index": i,
                        "message": {
                            "role": "assistant",
                            "content": string_content,
                        },
                        "finish_reason": finish_reason
                    }));
                }
                let reply = json!({
                    "object": "chat.completion",
                    "model": req.model,
                    "choices": choices_json,
                    "usage": serde_json::Value::Null, // Add usage field as null for now
                });
                Ok((http::StatusCode::OK, Json(reply)).into_response())
            }
            Err(e) => {
                let err_json = json!({
                    "error": format!("{:?}", e)
                });
                Err((http::StatusCode::BAD_GATEWAY, Json(err_json)))
            }
        }
    }
}

// GET /v1/models
async fn get_models() -> impl IntoResponse {
    let aliases = get_model_aliases();
    let model_list: Vec<JsonValue> = aliases
        .iter()
        .map(|(name, id)| {
            json!({
                "id": *id,
                "object": "model",
                "created": 0,
                "owned_by": "qwen",
                "alias": name,
            })
        })
        .collect();

    let out = json!({
        "object": "list",
        "data": model_list
    });

    Json(out)
}

async fn run_stream_example(client: SharedClient) {
    let message_content = "What is the capital of France?";
    let _role = "user";
    let request = ChatCompletionRequest {
        model: "qwen-max-latest".to_string(), // Ganti dengan model yang diinginkan
        messages: vec![ChatMessage {
            role: MessageRole::User,
            content: serde_json::Value::String(message_content.to_string()),
            tool_calls: None,
        }],
        temperature: None,
        max_tokens: None,
        stream: true,
        tools: vec![],
    };

    println!("Sending streaming chat completion request...");
    match client.stream(request).await {
        Ok((mut stream_rx, _close_rx)) => {
            print!("Assistant (streaming): ");
            // Flush stdout to ensure the print is displayed immediately
            use std::io::Write;
            std::io::stdout().flush().unwrap();

            loop {
                tokio::select! {
                    Some(response) = stream_rx.recv() => {
                        if let Some(choice) = response.choices.get(0) {
                            if let Some(content) = &choice.delta.content {
                                print!("{}", content);
                                std::io::stdout().flush().unwrap();
                            }
                        }
                    }
                    else => {
                        // Channel closed
                        break;
                    }
                }
            }
            println!("\nStreaming finished.");
        }
        Err(e) => {
            println!("Error creating streaming chat completion: {:?}", e);
        }
    }
}
