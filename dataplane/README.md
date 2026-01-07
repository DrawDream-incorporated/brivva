# Brivva Dataplane

Rust backend server for the Brivva live Korean to English translator.

## Overview

This server acts as a bridge between the web client and the LiveSpeech API. It:
- Accepts WebSocket connections from the web client
- Streams audio to the LiveSpeech SDK for real-time translation
- Returns translated audio back to the client

## Prerequisites

- Rust 1.70+ (install via [rustup](https://rustup.rs/))
- LiveSpeech API key

## Installation

```bash
cd dataplane
cargo build --release
```

## Running

```bash
cargo run
```

The server will start on `http://0.0.0.0:8080`.

## API Endpoints

### `GET /`
Health check endpoint. Returns `"Brivva Dataplane OK"`.

### `GET /ws`
WebSocket endpoint for audio streaming.

## WebSocket Protocol

### Client → Server

- **Binary messages**: PCM16 audio data (16kHz, mono, little-endian)
- **Text messages**: JSON control messages
  - `{"type": "stop"}` - Stop the translation session

### Server → Client

- **Binary messages**: Translated audio (PCM16, 24kHz, mono)
- **Text messages**: JSON status/error messages
  - `{"status": "connected"}` - Connection established
  - `{"status": "session_ready"}` - Ready to receive audio
  - `{"error": "..."}` - Error message

## Audio Format

### Input (from client)
- Format: PCM16 (16-bit signed, little-endian)
- Sample Rate: 16,000 Hz
- Channels: 1 (Mono)

### Output (to client)
- Format: PCM16 (16-bit signed, little-endian)
- Sample Rate: 24,000 Hz
- Channels: 1 (Mono)

## Configuration

The API key is currently hardcoded. For production, consider using environment variables:

```rust
let api_key = std::env::var("LIVESPEECH_API_KEY").expect("LIVESPEECH_API_KEY not set");
```

## Architecture

```
[Web Client] ←→ [WebSocket] ←→ [Dataplane Server] ←→ [LiveSpeech SDK] ←→ [LiveSpeech API]
```

## License

MIT