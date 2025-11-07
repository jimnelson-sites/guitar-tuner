
import React, { useState, useMemo } from 'react';
import { usePitchDetection } from './hooks/usePitchDetection';
import { TunerDisplay } from './components/TunerDisplay';
import { StringSelector } from './components/StringSelector';
import { TUNING_STANDARD, NOTE_NAMES, A4_FREQUENCY } from './constants';
import { NoteInfo, NoteName } from './types';

const freqToNote = (freq: number): NoteInfo => {
  const noteNum = 12 * (Math.log(freq / A4_FREQUENCY) / Math.log(2));
  const roundedNoteNum = Math.round(noteNum) + 69;
  const noteName = NOTE_NAMES[roundedNoteNum % 12];
  const octave = Math.floor(roundedNoteNum / 12) - 1;
  return { name: noteName, octave: octave };
};

const freqToCents = (freq: number, targetFreq: number): number => {
  return 1200 * Math.log2(freq / targetFreq);
};

const App: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeStringKey, setActiveStringKey] = useState<NoteName>('E2');
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPitchDetected = (freq: number) => {
    setDetectedFrequency(freq);
  };

  const { start, stop } = usePitchDetection({ onPitchDetected });

  const handleStart = async () => {
    try {
      await start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Microphone access was denied. Please allow microphone access in your browser settings.');
      setIsListening(false);
    }
  };

  const handleStop = () => {
    stop();
    setIsListening(false);
    setDetectedFrequency(null);
  };
  
  const handleStringSelect = (stringKey: NoteName) => {
      setActiveStringKey(stringKey);
      setDetectedFrequency(null);
  };

  const targetNoteInfo = useMemo(() => TUNING_STANDARD[activeStringKey], [activeStringKey]);
  
  const detectedNoteInfo = useMemo(() => {
    if (!detectedFrequency) return null;
    return freqToNote(detectedFrequency);
  }, [detectedFrequency]);

  const centsOff = useMemo(() => {
    if (!detectedFrequency) return 0;
    return freqToCents(detectedFrequency, targetNoteInfo.freq);
  }, [detectedFrequency, targetNoteInfo]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Guitar Tuner</h1>
          <p className="text-gray-400 mt-2">Standard Tuning (E A D G B E)</p>
        </header>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-8 text-center">{error}</div>}

        {isListening ? (
          <div className="w-full flex flex-col items-center gap-8">
            <StringSelector
              tuning={TUNING_STANDARD}
              activeStringKey={activeStringKey}
              onStringSelect={handleStringSelect}
            />
            <TunerDisplay
              targetNote={targetNoteInfo}
              detectedNote={detectedNoteInfo}
              centsOff={centsOff}
            />
            <button
              onClick={handleStop}
              className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-gray-300">Click the button below to start the tuner.</p>
            <button
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-transform transform hover:scale-105"
            >
              Start Tuner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
