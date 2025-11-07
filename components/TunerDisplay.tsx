
import React from 'react';
import { NoteInfo, TuningNote } from '../types';

interface TunerDisplayProps {
  targetNote: TuningNote;
  detectedNote: NoteInfo | null;
  centsOff: number;
}

const IN_TUNE_THRESHOLD = 2; // Cents
const CLOSE_THRESHOLD = 10; // Cents

const getTuningStatus = (cents: number): { color: string, text: string, inTune: boolean } => {
  const absCents = Math.abs(cents);
  if (absCents < IN_TUNE_THRESHOLD) {
    return { color: 'border-green-500', text: 'In Tune', inTune: true };
  }
  if (absCents < CLOSE_THRESHOLD) {
    return { color: 'border-yellow-500', text: cents < 0 ? 'Slightly Flat' : 'Slightly Sharp', inTune: false };
  }
  return { color: 'border-red-500', text: cents < 0 ? 'Too Low' : 'Too High', inTune: false };
};

export const TunerDisplay: React.FC<TunerDisplayProps> = ({ targetNote, detectedNote, centsOff }) => {
  const rotation = Math.max(-45, Math.min(45, centsOff * 0.9));
  const { color, text, inTune } = getTuningStatus(centsOff);
  const isNoteActive = detectedNote !== null && Math.abs(centsOff) <= 50;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px 5px rgba(74, 222, 128, 0.4);
          }
          50% {
            box-shadow: 0 0 25px 10px rgba(74, 222, 128, 0.7);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
      `}</style>
      
      <div className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 bg-gray-800/50 flex items-center justify-center transition-colors duration-300 ${color}`}>
        {/* Ticks */}
        <div className="absolute w-full h-full">
          {[-40, -30, -20, -10, 10, 20, 30, 40].map((deg) => (
             <div key={deg} className="absolute w-1 h-3 bg-gray-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-[0.5px_128px] sm:origin-[0.5px_160px]" style={{ transform: `rotate(${deg * 0.9}deg)` }}></div>
          ))}
           <div className="absolute w-1.5 h-6 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"></div>
        </div>

        {/* Needle */}
        <div 
          className="absolute w-1 h-1/2 bg-red-500 top-0 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>

        {/* Center Circle */}
        <div className={`w-8 h-8 rounded-full border-4 border-gray-900 z-10 transition-colors duration-300 ${(inTune && isNoteActive) ? 'bg-green-500 animate-pulse-glow' : 'bg-gray-700'}`}></div>
        
        {/* Note Display */}
        <div className="absolute z-20 text-center">
            <div className={`
              text-7xl sm:text-8xl font-mono font-bold transition-all duration-300
              ${(inTune && isNoteActive) ? 'text-green-400 scale-110' : 'text-white'}
              ${isNoteActive ? 'opacity-100' : 'opacity-20'}
            `}>
                {targetNote.stringName}
            </div>
             <p className="text-gray-400 text-lg -mt-2">
                { isNoteActive && detectedNote?.octave !== undefined ? `Octave ${detectedNote.octave}` : 'Pluck the string' }
             </p>
        </div>
      </div>
      <div className="mt-6 text-center h-16 flex flex-col justify-center">
        {isNoteActive ? (
          <>
            <p className="text-2xl font-semibold">{text}</p>
            <p className="text-gray-400 font-mono">{centsOff.toFixed(1)} cents</p>
          </>
        ) : (
           <p className="text-2xl font-semibold text-gray-500">Listening...</p>
        )}
      </div>
    </div>
  );
};
