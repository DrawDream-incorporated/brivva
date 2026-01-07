import { useAudioTranslator } from './hooks/useAudioTranslator';
import { TranslatorControls } from './components/TranslatorControls';
import './App.css';

function App() {
  const { status, isRecording, error, startTranslation, stopTranslation } =
    useAudioTranslator();

  return (
    <div className="app">
      <TranslatorControls
        status={status}
        isRecording={isRecording}
        error={error}
        onStart={startTranslation}
        onStop={stopTranslation}
      />
    </div>
  );
}

export default App;