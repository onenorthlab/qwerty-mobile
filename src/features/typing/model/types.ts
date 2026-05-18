export interface Word {
  name: string;
  trans: string[];
  usphone?: string;
  ukphone?: string;
}

export type WordIndex = number;

export interface TypingState {
  words: Word[];
  currentIndex: WordIndex;
  input: string;
  hasWrong: boolean;
  startedAt: number | null;
  wordStartedAt: number | null;
  finishedAt: number | null;
  wordTimings: Record<WordIndex, number>;
  mistakesByWord: Record<WordIndex, string[]>;
}

export type TypingAction =
  | { type: 'START'; words: Word[]; at: number }
  | { type: 'SUBMIT_INPUT'; value: string; at: number }
  | { type: 'CLEAR_WRONG' }
  | { type: 'RESET' };

export interface SessionSummary {
  totalWords: number;
  durationMs: number;
  wpm: number;
  accuracy: number;
  mistakes: { word: string; attempts: string[] }[];
}
