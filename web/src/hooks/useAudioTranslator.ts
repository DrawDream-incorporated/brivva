import { useState, useRef, useCallback, useEffect } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseAudioTranslatorReturn {
  status: ConnectionStatus;
  isRecording: boolean;
  error: string | null;
  startTranslation: () => Promise<void>;
  stopTranslation: () => void;
}

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:9090/ws';
const SAMPLE_RATE = 16000
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;
const INITIAL_BUFFER_COUNT = 3;

export function useAudioTranslator(): UseAudioTranslatorReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio playback state
  const audioQueueRef = useRef<Float32Array[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const playbackStartedRef = useRef(false);

  // Schedule and play audio chunks with precise timing
  const scheduleAudioPlayback = useCallback(() => {
    const audioContext = outputAudioContextRef.current;
    if (!audioContext || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;

    // Process all queued chunks
    while (audioQueueRef.current.length > 0) {
      const float32Array = audioQueueRef.current.shift()!;
      
      const audioBuffer = audioContext.createBuffer(
        1, // mono
        float32Array.length,
        OUTPUT_SAMPLE_RATE
      );
      
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Calculate when to play this chunk
      const currentTime = audioContext.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      
      source.start(startTime);
      
      // Update next play time (duration of this buffer)
      const duration = float32Array.length / OUTPUT_SAMPLE_RATE;
      nextPlayTimeRef.current = startTime + duration;
    }

    isPlayingRef.current = false;
  }, []);

  // Play received audio with buffering for smooth playback
  const playAudioChunk = useCallback((audioData: ArrayBuffer) => {
    if (!outputAudioContextRef.current) return;

    try {
      // Convert Int16 PCM to Float32
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      audioQueueRef.current.push(float32Array);
      
      // Wait for initial buffer before starting playback
      if (!playbackStartedRef.current) {
        if (audioQueueRef.current.length >= INITIAL_BUFFER_COUNT) {
          playbackStartedRef.current = true;
          // Reset next play time to current time
          nextPlayTimeRef.current = outputAudioContextRef.current.currentTime;
          scheduleAudioPlayback();
        }
      } else {
        // Continue scheduling as chunks arrive
        scheduleAudioPlayback();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  }, [scheduleAudioPlayback]);

  // Convert Float32 audio to Int16 PCM
  const floatTo16BitPCM = useCallback((float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return buffer;
  }, []);

  // Downsample audio to target sample rate
  const downsample = useCallback((buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
    if (inputSampleRate === outputSampleRate) {
      return buffer;
    }
    
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const index = Math.round(i * sampleRateRatio);
      result[i] = buffer[index];
    }
    
    return result;
  }, []);

  const startTranslation = useCallback(async () => {
    try {
      setError(null);
      setStatus('connecting');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      mediaStreamRef.current = stream;

      // Create separate audio contexts for input and output
      // Input context for recording (matches mic sample rate)
      inputAudioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
      
      // Output context for playback at 24kHz (LiveSpeech output format)
      outputAudioContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      const actualSampleRate = inputAudioContextRef.current.sampleRate;
      
      // Reset playback state
      audioQueueRef.current = [];
      nextPlayTimeRef.current = 0;
      isPlayingRef.current = false;
      playbackStartedRef.current = false;

      // Create WebSocket connection
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          const message = JSON.parse(event.data);
          if (message.status === 'session_ready') {
            setStatus('connected');
            setIsRecording(true);
          } else if (message.error) {
            setError(message.error);
            setStatus('error');
          }
        } else if (event.data instanceof ArrayBuffer) {
          // Received audio data
          playAudioChunk(event.data);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setStatus('error');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (status !== 'error') {
          setStatus('disconnected');
        }
        setIsRecording(false);
      };

      // Set up audio processing for input
      sourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = inputAudioContextRef.current.createScriptProcessor(BUFFER_SIZE, 1, 1);

      processorRef.current.onaudioprocess = (e: AudioProcessingEvent) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampledData = downsample(inputData, actualSampleRate, SAMPLE_RATE);
          const pcmData = floatTo16BitPCM(downsampledData);
          ws.send(pcmData);
        }
      };

      sourceRef.current.connect(processorRef.current);
      // Connect to destination to keep the processor running (but we don't output the mic audio)
      processorRef.current.connect(inputAudioContextRef.current.destination);

    } catch (err) {
      console.error('Error starting translation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start translation');
      setStatus('error');
    }
  }, [downsample, floatTo16BitPCM, playAudioChunk, status]);

  const stopTranslation = useCallback(() => {
    // Send stop message
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      wsRef.current.close();
    }
    wsRef.current = null;

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      mediaStreamRef.current = null;
    }

    // Clear audio queue and reset state
    audioQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    isPlayingRef.current = false;
    playbackStartedRef.current = false;

    setIsRecording(false);
    setStatus('disconnected');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranslation();
    };
  }, [stopTranslation]);

  return {
    status,
    isRecording,
    error,
    startTranslation,
    stopTranslation,
  };
}