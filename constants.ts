

// FIX: Removed the unused import of `Tuning` to break a circular dependency with `types.ts`.
// import { Tuning } from './types';

// FIX: Removed the explicit type annotation `: Tuning` from `TUNING_STANDARD` to break a circular dependency.
// The type is now inferred by TypeScript, which resolves type errors in multiple files.
export const TUNING_STANDARD = {
  E2: { freq: 82.41, stringName: 'E' },
  A2: { freq: 110.00, stringName: 'A' },
  D3: { freq: 146.83, stringName: 'D' },
  G3: { freq: 196.00, stringName: 'G' },
  B3: { freq: 246.94, stringName: 'B' },
  E4: { freq: 329.63, stringName: 'e' },
};

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const A4_FREQUENCY = 440;