import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Volume2, RotateCcw } from 'lucide-react-native';
import { Button, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { createInitialState, typingReducer } from '../model/reducer';
import { getCurrentWord, isFinished } from '../model/selectors';
import type { Word } from '../model/types';
import { usePronunciation, type Accent } from '../../audio';
import { ResultScreen } from './ResultScreen';

interface TypingScreenProps {
  words: Word[];
  accent?: Accent;
  onExit: () => void;
  onComplete?: (mistakes: { word: string; attempts: string[] }[]) => void;
}

export function TypingScreen({ words, accent = 'us', onExit, onComplete }: TypingScreenProps) {
  const { t } = useTranslation();
  const [accentColor, muted, success, danger, surface] = useThemeColor([
    'accent',
    'muted',
    'success',
    'danger',
    'surface',
  ] as const);
  const inputRef = useRef<TextInput>(null);
  const completedRef = useRef(false);

  const [state, dispatch] = useReducer(typingReducer, createInitialState());
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    if (words.length === 0) return;
    dispatch({ type: 'START', words, at: Date.now() });
    completedRef.current = false;
    setTextValue('');
  }, [words]);

  const { play, stop } = usePronunciation();
  const currentWord = getCurrentWord(state);

  useEffect(() => {
    if (currentWord) {
      void play(currentWord.name, accent);
    }
    return () => stop();
  }, [currentWord, accent, play, stop]);

  useEffect(() => {
    if (state.hasWrong) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_WRONG' });
        setTextValue('');
      }, 350);
      return () => clearTimeout(timer);
    }
    return;
  }, [state.hasWrong]);

  useEffect(() => {
    setTextValue(state.input);
  }, [state.input]);

  useEffect(() => {
    if (isFinished(state) && !completedRef.current) {
      completedRef.current = true;
      const mistakes = state.words
        .map((w, i) => ({ word: w.name, attempts: state.mistakesByWord[i] ?? [] }))
        .filter((m) => m.attempts.length > 0);
      onComplete?.(mistakes);
    }
  }, [state, onComplete]);

  const progressText = useMemo(() => {
    if (isFinished(state)) return `${words.length} / ${words.length}`;
    return `${state.currentIndex + 1} / ${words.length}`;
  }, [state, words.length]);

  if (isFinished(state)) {
    return (
      <ResultScreen
        state={state}
        onRestart={() => {
          dispatch({ type: 'START', words, at: Date.now() });
          completedRef.current = false;
          setTextValue('');
        }}
        onExit={onExit}
      />
    );
  }

  if (!currentWord) {
    return (
      <View testID="typing-empty" className="flex-1 items-center justify-center p-6">
        <Text style={{ color: muted }} className="text-base">
          {t('typing_empty')}
        </Text>
        <Button testID="typing-empty-back" variant="outline" onPress={onExit} className="mt-4">
          {t('typing_back')}
        </Button>
      </View>
    );
  }

  const inputBorderColor = state.hasWrong ? danger : accentColor;

  return (
    <View testID="typing-screen" className="flex-1 px-6 py-8 gap-6">
      <View className="flex-row items-center justify-between">
        <Text testID="typing-progress" style={{ color: muted }} className="text-sm">
          {progressText}
        </Text>
        <Pressable
          testID="typing-replay"
          onPress={() => {
            void play(currentWord.name, accent);
          }}
          style={{ backgroundColor: surface }}
          className="px-3 py-2 rounded-xl flex-row items-center"
        >
          <Volume2 size={16} color={accentColor} strokeWidth={1.5} />
          <Text className="ml-2 text-sm" style={{ color: accentColor }}>
            {t('typing_replay')}
          </Text>
        </Pressable>
      </View>

      <View
        style={{ backgroundColor: surface }}
        className="rounded-2xl p-6 items-center gap-3"
      >
        <Text style={{ color: muted }} className="text-xs uppercase tracking-wider">
          {t('typing_hint_translation')}
        </Text>
        <Text
          testID="typing-translation"
          style={{ color: muted }}
          className="text-center text-base font-semibold"
        >
          {currentWord.trans.join('; ')}
        </Text>
        {currentWord.usphone ? (
          <Text style={{ color: muted, opacity: 0.6 }} className="text-xs">
            /{currentWord.usphone}/
          </Text>
        ) : null}
      </View>

      <View className="items-center">
        <Text
          testID="typing-input-display"
          style={{
            color: state.hasWrong ? danger : success,
            letterSpacing: 3,
            fontFamily: 'Inter-SemiBold',
          }}
          className="text-3xl"
        >
          {state.input || ' '}
        </Text>
        <Text style={{ color: muted, opacity: 0.4 }} className="text-xs mt-2">
          {state.hasWrong ? t('typing_wrong_retry') : t('typing_input_hint')}
        </Text>
      </View>

      <TextInput
        ref={inputRef}
        testID="typing-input"
        value={textValue}
        onChangeText={(value) => {
          setTextValue(value);
          dispatch({ type: 'SUBMIT_INPUT', value, at: Date.now() });
        }}
        onBlur={() => {
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        keyboardType="default"
        autoFocus
        style={{
          borderColor: inputBorderColor,
          borderWidth: 2,
          borderRadius: 12,
          padding: 14,
          fontSize: 18,
          letterSpacing: 2,
          color: muted,
        }}
      />

      <Pressable
        testID="typing-exit"
        onPress={onExit}
        className="flex-row items-center justify-center mt-2"
      >
        <RotateCcw size={14} color={muted} strokeWidth={1.5} />
        <Text style={{ color: muted, opacity: 0.7 }} className="ml-2 text-sm">
          {t('typing_back')}
        </Text>
      </Pressable>
    </View>
  );
}
