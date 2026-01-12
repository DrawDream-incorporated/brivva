use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, Query},
    response::IntoResponse,
    routing::get,
    Router,
};
use std::collections::HashMap;
use futures::{SinkExt, StreamExt};
use livespeech_sdk::{Config, LiveSpeechClient, LiveSpeechEvent, Region, SessionConfig};
use std::sync::Arc;
use tokio::sync::mpsc;
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info};

fn get_api_key() -> String {
    std::env::var("LIVESPEECH_API_KEY").expect("LIVESPEECH_API_KEY environment variable not set")
}

// System prompts for different feature flags
const DEFAULT_PROMPT: &str = "You are a fast simultaneous interpreter. Translate constantly. Do not wait for long context. Keep answers short and immediate.";

const FLAG_A_PROMPT: &str = r#"Listen to Korean instructions. Respond in Korean with:
"네, [instruction summary]을/를 [Name1]와 [Name2]에게 전달 완료했습니다."

Use Vietnamese names: Nguyễn Văn Minh, Trần Thị Lan, Lê Hoàng Nam, Phạm Thị Hoa, Võ Văn Đức

Example:
Input: "3번 밭 고추는 꼭지를 짧게 따"
Output: "네, 고추 꼭지 짧게 따기를 Nguyễn Văn Minh와 Trần Thị Lan에게 전달 완료했습니다."
"#;

const FLAG_B_PROMPT: &str = "Placeholder prompt for flagB. To be defined later.";

#[tokio::main]
async fn main() {
    // Load environment variables from .env file
    dotenv::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("brivva_dataplane=info".parse().unwrap()),
        )
        .init();

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/", get(health_check))
        .route("/ws", get(ws_handler))
        .layer(cors);

    let addr = "0.0.0.0:8080";
    info!("Starting Brivva Dataplane server on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    "Brivva Dataplane OK"
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    let flag = params.get("flag").cloned();
    ws.on_upgrade(move |socket| handle_socket(socket, flag))
}

async fn handle_socket(socket: WebSocket, flag: Option<String>) {
    info!("New WebSocket connection established");

    let (mut ws_sender, mut ws_receiver) = socket.split();

    // Get API key from environment
    let api_key = get_api_key();

    // Create LiveSpeech client configuration
    let config = match Config::builder()
        .region(Region::ApNortheast2)
        .api_key(&api_key)
        .build()
    {
        Ok(config) => config,
        Err(e) => {
            error!("Failed to create LiveSpeech config: {}", e);
            let _ = ws_sender
                .send(Message::Text(
                    serde_json::json!({"error": format!("Failed to create config: {}", e)})
                        .to_string(),
                ))
                .await;
            return;
        }
    };

    let client = Arc::new(LiveSpeechClient::new(config));

    // Subscribe to events before connecting
    let mut events = client.subscribe();

    // Channel for audio output from LiveSpeech to WebSocket
    let (audio_tx, mut audio_rx) = mpsc::channel::<Vec<u8>>(100);
    let (status_tx, mut status_rx) = mpsc::channel::<String>(10);

    // Task to handle LiveSpeech events
    let event_task = tokio::spawn(async move {
        while let Ok(event) = events.recv().await {
            match event {
                LiveSpeechEvent::Ready(_) => {
                    info!("LiveSpeech ready for audio");
                    let _ = status_tx.send("session_ready".to_string()).await;
                }
                LiveSpeechEvent::UserTranscript(e) => {
                    info!("User transcript: {}", e.text);
                }
                LiveSpeechEvent::Response(e) => {
                    info!("AI response: {} (final: {})", e.text, e.is_final);
                }
                LiveSpeechEvent::Audio(e) => {
                    // Forward audio to WebSocket
                    if audio_tx.send(e.data).await.is_err() {
                        break;
                    }
                }
                LiveSpeechEvent::TurnComplete(_) => {
                    info!("AI turn complete");
                }
                LiveSpeechEvent::Error(e) => {
                    error!("LiveSpeech error: {:?} - {}", e.code, e.message);
                    let _ = status_tx
                        .send(format!("error:{}", e.message))
                        .await;
                }
                _ => {}
            }
        }
    });

    // Connect to LiveSpeech
    if let Err(e) = client.connect().await {
        error!("Failed to connect to LiveSpeech: {}", e);
        let _ = ws_sender
            .send(Message::Text(
                serde_json::json!({"error": format!("Failed to connect: {}", e)}).to_string(),
            ))
            .await;
        return;
    }

    info!("Connected to LiveSpeech");

    // Select system prompt based on feature flag
    let (system_prompt, ai_speak_first) = match flag.as_deref() {
        Some("flagA") => {
            info!("Using flagA prompt (DrawDream farm instruction)");
            (FLAG_A_PROMPT, true)
        }
        Some("flagB") => {
            info!("Using flagB prompt (placeholder)");
            (FLAG_B_PROMPT, true)
        }
        _ => {
            info!("Using default prompt (interpreter)");
            (DEFAULT_PROMPT, false)
        }
    };

    // Start session with selected prompt and AI speak first option
    let session_config = if ai_speak_first {
        SessionConfig::new(system_prompt).with_ai_speaks_first(true)
    } else {
        SessionConfig::new(system_prompt)
    };

    if let Err(e) = client.start_session(Some(session_config)).await {
        error!("Failed to start LiveSpeech session: {}", e);
        let _ = ws_sender
            .send(Message::Text(
                serde_json::json!({"error": format!("Failed to start session: {}", e)})
                    .to_string(),
            ))
            .await;
        client.disconnect().await;
        return;
    }

    info!("LiveSpeech session started");

    // Start audio streaming
    if let Err(e) = client.audio_start().await {
        error!("Failed to start audio: {}", e);
        let _ = ws_sender
            .send(Message::Text(
                serde_json::json!({"error": format!("Failed to start audio: {}", e)}).to_string(),
            ))
            .await;
        let _ = client.end_session().await;
        client.disconnect().await;
        return;
    }

    // Task to send status messages to WebSocket
    let (ws_msg_tx, mut ws_msg_rx) = mpsc::channel::<Message>(100);
    let ws_msg_tx_clone = ws_msg_tx.clone();
    
    tokio::spawn(async move {
        while let Some(status) = status_rx.recv().await {
            if status.starts_with("error:") {
                let error_msg = status.strip_prefix("error:").unwrap_or(&status);
                let _ = ws_msg_tx_clone
                    .send(Message::Text(
                        serde_json::json!({"error": error_msg}).to_string(),
                    ))
                    .await;
            } else {
                let _ = ws_msg_tx_clone
                    .send(Message::Text(
                        serde_json::json!({"status": status}).to_string(),
                    ))
                    .await;
            }
        }
    });

    // Task to send audio to WebSocket
    let ws_msg_tx_audio = ws_msg_tx.clone();
    tokio::spawn(async move {
        while let Some(audio_data) = audio_rx.recv().await {
            if ws_msg_tx_audio.send(Message::Binary(audio_data)).await.is_err() {
                break;
            }
        }
    });

    // Task to send messages through WebSocket
    let ws_send_task = tokio::spawn(async move {
        while let Some(msg) = ws_msg_rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // Send initial ready message
    let _ = ws_msg_tx
        .send(Message::Text(
            serde_json::json!({"status": "connected"}).to_string(),
        ))
        .await;

    // Main loop: receive audio from WebSocket and send to LiveSpeech
    let client_clone = client.clone();
    while let Some(msg) = ws_receiver.next().await {
        match msg {
            Ok(Message::Binary(data)) => {
                // Forward audio to LiveSpeech
                if let Err(e) = client_clone.send_audio_chunk(&data).await {
                    error!("Error sending audio to LiveSpeech: {}", e);
                    break;
                }
            }
            Ok(Message::Text(text)) => {
                // Handle control messages
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                    if json.get("type").and_then(|v| v.as_str()) == Some("stop") {
                        info!("Received stop command");
                        break;
                    }
                }
            }
            Ok(Message::Close(_)) => {
                info!("WebSocket closed by client");
                break;
            }
            Err(e) => {
                error!("WebSocket error: {}", e);
                break;
            }
            _ => {}
        }
    }

    // Cleanup
    info!("Closing LiveSpeech session");
    let _ = client.audio_end().await;
    let _ = client.end_session().await;
    client.disconnect().await;
    
    event_task.abort();
    ws_send_task.abort();
}