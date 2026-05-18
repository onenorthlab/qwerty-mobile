import type { TypingAction, TypingState, Word } from './types';

export function createInitialState(): TypingState {
  return {
    words: [],
    currentIndex: 0,
    input: '',
    hasWrong: false,
    startedAt: null,
    wordStartedAt: null,
    finishedAt: null,
    wordTimings: {},
    mistakesByWord: {},
  };
}

export function typingReducer(state: TypingState, action: TypingAction): TypingState {
  switch (action.type) {
    case 'START':
      return {
        ...createInitialState(),
        words: action.words,
        startedAt: action.at,
        wordStartedAt: action.at,
      };

    case 'RESET':
      return createInitialState();

    case 'CLEAR_WRONG':
      return state.hasWrong ? { ...state, hasWrong: false, input: '' } : state;

    case 'SUBMIT_INPUT': {
      if (state.finishedAt !== null) return state;
      const current: Word | undefined = state.words[state.currentIndex];
      if (!current) return state;

      const target = current.name;
      const value = action.value;
      const startedAt = state.startedAt ?? action.at;
      const wordStartedAt = state.wordStartedAt ?? action.at;

      if (value.length >= target.length) {
        if (value.toLowerCase() === target.toLowerCase()) {
          const nextIndex = state.currentIndex + 1;
          const isDone = nextIndex >= state.words.length;
          return {
            ...state,
            startedAt,
            wordStartedAt: isDone ? null : action.at,
            currentIndex: isDone ? state.currentIndex : nextIndex,
            input: '',
            hasWrong: false,
            wordTimings: {
              ...state.wordTimings,
              [state.currentIndex]: action.at - wordStartedAt,
            },
            finishedAt: isDone ? action.at : null,
          };
        }
        return markWrong(state, action.value, startedAt, wordStartedAt);
      }

      if (target.toLowerCase().startsWith(value.toLowerCase())) {
        return {
          ...state,
          startedAt,
          wordStartedAt,
          input: value,
          hasWrong: false,
        };
      }

      return markWrong(state, action.value, startedAt, wordStartedAt);
    }

    default:
      return state;
  }
}

function markWrong(
  state: TypingState,
  attempt: string,
  startedAt: number,
  wordStartedAt: number,
): TypingState {
  const previous = state.mistakesByWord[state.currentIndex] ?? [];
  return {
    ...state,
    startedAt,
    wordStartedAt,
    input: '',
    hasWrong: true,
    mistakesByWord: {
      ...state.mistakesByWord,
      [state.currentIndex]: [...previous, attempt],
    },
  };
}
