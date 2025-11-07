import { NOTE_NAMES } from './constants';

// FIX: Broke circular dependency by defining NoteName directly instead of deriving it from TUNING_STANDARD.
export type NoteName = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

export interface NoteInfo {
    name: typeof NOTE_NAMES[number];
    octave: number;
}

export interface TuningNote {
    freq: number;
    stringName: string;
}

export type Tuning = Record<NoteName, TuningNote>;
