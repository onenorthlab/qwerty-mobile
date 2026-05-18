import { createInitialState, typingReducer } from '../reducer';
import { getCurrentWord, getSessionSummary, isFinished } from '../selectors';
import type { Word } from '../types';

const W = (name: string, trans = ['test']): Word => ({ name, trans });

describe('typingReducer', () => {
  it('START initializes session with given words and starts the timer', () => {
    const initial = createInitialState();
    const next = typingReducer(initial, {
      type: 'START',
      words: [W('hi'), W('go')],
      at: 1000,
    });
    expect(next.words).toHaveLength(2);
    expect(next.currentIndex).toBe(0);
    expect(getCurrentWord(next)?.name).toBe('hi');
    expect(next.startedAt).toBe(1000);
  });

  it('SUBMIT_INPUT accepts prefix-in-progress without advancing', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('hello')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'he', at: 100 });
    expect(state.input).toBe('he');
    expect(state.currentIndex).toBe(0);
    expect(state.startedAt).toBe(0);
    expect(state.hasWrong).toBe(false);
  });

  it('SUBMIT_INPUT marks wrong and clears input on bad prefix', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('hello')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'hx', at: 50 });
    expect(state.hasWrong).toBe(true);
    expect(state.input).toBe('');
    expect(state.mistakesByWord[0]).toEqual(['hx']);
  });

  it('SUBMIT_INPUT is case-insensitive', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('Cancel')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'CANCEL', at: 200 });
    expect(state.currentIndex).toBe(0);
    expect(isFinished(state)).toBe(true);
  });

  it('advances to next word on full match and finishes on last', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('a'), W('b')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'a', at: 100 });
    expect(state.currentIndex).toBe(1);
    expect(state.input).toBe('');
    expect(isFinished(state)).toBe(false);

    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'b', at: 200 });
    expect(isFinished(state)).toBe(true);
    expect(state.finishedAt).toBe(200);
    expect(state.wordTimings[0]).toBe(100);
    expect(state.wordTimings[1]).toBe(100);
  });

  it('ignores input after session is finished', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('a')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'a', at: 100 });
    const frozen = state;
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'b', at: 200 });
    expect(state).toBe(frozen);
  });

  it('CLEAR_WRONG resets the wrong flag and is no-op when not wrong', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('cat')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'x', at: 10 });
    expect(state.hasWrong).toBe(true);
    state = typingReducer(state, { type: 'CLEAR_WRONG' });
    expect(state.hasWrong).toBe(false);
    const same = typingReducer(state, { type: 'CLEAR_WRONG' });
    expect(same).toBe(state);
  });

  it('getSessionSummary computes wpm and accuracy with mistakes', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('go'), W('on')],
      at: 0,
    });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'gx', at: 500 });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'go', at: 1000 });
    state = typingReducer(state, { type: 'SUBMIT_INPUT', value: 'on', at: 60_000 });
    const summary = getSessionSummary(state);
    expect(summary).not.toBeNull();
    expect(summary?.totalWords).toBe(2);
    expect(summary?.mistakes).toHaveLength(1);
    expect(summary?.mistakes[0]?.word).toBe('go');
    expect(summary?.accuracy).toBeCloseTo(4 / 6, 5);
    expect(summary?.wpm).toBe(2);
  });

  it('RESET returns to a fresh empty state', () => {
    let state = typingReducer(createInitialState(), {
      type: 'START',
      words: [W('any')],
      at: 0,
    });
    state = typingReducer(state, { type: 'RESET' });
    expect(state).toEqual(createInitialState());
  });
});
