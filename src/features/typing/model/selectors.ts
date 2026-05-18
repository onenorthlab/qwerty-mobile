import type { SessionSummary, TypingState, Word } from './types';

export function getCurrentWord(state: TypingState): Word | null {
  return state.words[state.currentIndex] ?? null;
}

export function isFinished(state: TypingState): boolean {
  return state.finishedAt !== null;
}

export function getProgress(state: TypingState): { completed: number; total: number } {
  return {
    completed: isFinished(state) ? state.words.length : state.currentIndex,
    total: state.words.length,
  };
}

export function getSessionSummary(state: TypingState): SessionSummary | null {
  if (state.startedAt === null || state.finishedAt === null) return null;

  const totalWords = state.words.length;
  const durationMs = Math.max(1, state.finishedAt - state.startedAt);
  const durationMin = durationMs / 60_000;

  const correctChars = state.words.reduce((acc, w) => acc + w.name.length, 0);
  const wrongAttemptsLength = Object.values(state.mistakesByWord).reduce(
    (acc, attempts) => acc + attempts.reduce((a, s) => a + s.length, 0),
    0,
  );

  const wpm = Math.round(totalWords / durationMin);
  const totalChars = correctChars + wrongAttemptsLength;
  const accuracy = totalChars === 0 ? 1 : correctChars / totalChars;

  const mistakes = state.words
    .map((w, i) => ({ word: w.name, attempts: state.mistakesByWord[i] ?? [] }))
    .filter((m) => m.attempts.length > 0);

  return {
    totalWords,
    durationMs,
    wpm,
    accuracy,
    mistakes,
  };
}
