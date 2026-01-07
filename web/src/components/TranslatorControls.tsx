import { ConnectionStatus } from '../hooks/useAudioTranslator';

interface TranslatorControlsProps {
  status: ConnectionStatus;
  isRecording: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function TranslatorControls({
  status,
  isRecording,
  error,
  onStart,
  onStop,
}: TranslatorControlsProps) {
  const getStatusText = () => {
    switch (status) {
      case 'disconnected':
        return 'Ready to translate';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Translating Korean → English';
      case 'error':
        return 'Connection error';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'disconnected':
        return '#6c757d';
      case 'connecting':
        return '#ffc107';
      case 'connected':
        return '#28a745';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Brivva</h1>
      <p style={styles.subtitle}>Live Korean to English Translator</p>

      <div style={styles.statusContainer}>
        <div
          style={{
            ...styles.statusIndicator,
            backgroundColor: getStatusColor(),
            boxShadow: isRecording ? `0 0 20px ${getStatusColor()}` : 'none',
          }}
        />
        <span style={styles.statusText}>{getStatusText()}</span>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.buttonContainer}>
        {!isRecording ? (
          <button
            style={{
              ...styles.button,
              ...styles.startButton,
            }}
            onClick={onStart}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? (
              <span style={styles.spinner}>⏳</span>
            ) : (
              <>
                <span style={styles.micIcon}>🎤</span>
                Start Translation
              </>
            )}
          </button>
        ) : (
          <button
            style={{
              ...styles.button,
              ...styles.stopButton,
            }}
            onClick={onStop}
          >
            <span style={styles.stopIcon}>⏹</span>
            Stop Translation
          </button>
        )}
      </div>

      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>How to use:</h3>
        <ol style={styles.instructionsList}>
          <li>Click "Start Translation" to begin</li>
          <li>Allow microphone access when prompted</li>
          <li>Speak in Korean</li>
          <li>Listen to the English translation</li>
        </ol>
      </div>

      {isRecording && (
        <div style={styles.visualizer}>
          <div style={{ ...styles.bar, animationDelay: '0s' }} />
          <div style={{ ...styles.bar, animationDelay: '0.1s' }} />
          <div style={{ ...styles.bar, animationDelay: '0.2s' }} />
          <div style={{ ...styles.bar, animationDelay: '0.3s' }} />
          <div style={{ ...styles.bar, animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#a0aec0',
    margin: 0,
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50px',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  statusText: {
    fontSize: '0.95rem',
    color: '#e2e8f0',
  },
  error: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    border: '1px solid rgba(220, 53, 69, 0.5)',
    borderRadius: '8px',
    color: '#f8d7da',
    fontSize: '0.9rem',
  },
  buttonContainer: {
    marginTop: '1rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '220px',
  },
  startButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  stopButton: {
    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    color: 'white',
  },
  micIcon: {
    fontSize: '1.3rem',
  },
  stopIcon: {
    fontSize: '1.1rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
  instructions: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    width: '100%',
  },
  instructionsTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    color: '#a0aec0',
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '1.5rem',
    color: '#cbd5e0',
    lineHeight: '1.8',
  },
  visualizer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '40px',
    marginTop: '1rem',
  },
  bar: {
    width: '4px',
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: '2px',
    animation: 'pulse 0.8s ease-in-out infinite',
  },
};

// Add keyframe animations via style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `;
  document.head.appendChild(styleSheet);
}