# Brivva Web Client

React TypeScript web application for the Brivva live Korean to English translator.

## Overview

A real-time speech translation interface that:
- Captures microphone audio using Web Audio API
- Streams audio to the Brivva backend via WebSocket
- Plays back translated English audio in real-time

## Prerequisites

- Node.js 18+
- npm or yarn
- Brivva Dataplane server running on port 8080

## Installation

```bash
cd web
npm install
```

## Development

```bash
npm run dev
```

The development server will start on `http://localhost:5173`.

## Build

```bash
npm run build
```

## Project Structure

```
web/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Main App component
│   ├── App.css               # App styles
│   ├── index.css             # Global styles
│   ├── vite-env.d.ts         # Vite type declarations
│   ├── components/
│   │   └── TranslatorControls.tsx  # UI controls for translation
│   └── hooks/
│       └── useAudioTranslator.ts   # Audio capture & WebSocket hook
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Features

### Audio Capture
- Captures microphone audio at 16kHz
- Converts to PCM16 format for the backend
- Handles browser sample rate differences with downsampling

### WebSocket Communication
- Connects to backend at `ws://localhost:8080/ws`
- Sends binary audio chunks
- Receives translated audio and plays it back

### Audio Playback
- Queues received audio chunks
- Plays back at 24kHz (LiveSpeech output format)
- Smooth playback with queue management

## Usage

1. Start the Brivva Dataplane server (port 8080)
2. Start the web development server (port 5173)
3. Open http://localhost:5173 in your browser
4. Click "Start Translation"
5. Allow microphone access when prompted
6. Speak in Korean
7. Listen to the English translation

## Audio Format

### Microphone Input
- Format: PCM16 (16-bit signed, little-endian)
- Sample Rate: 16,000 Hz
- Channels: 1 (Mono)

### Translation Output
- Format: PCM16 (16-bit signed, little-endian)
- Sample Rate: 24,000 Hz
- Channels: 1 (Mono)

## Browser Support

Requires:
- Web Audio API
- MediaDevices API (getUserMedia)
- WebSocket API

Tested on:
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## License

MIT