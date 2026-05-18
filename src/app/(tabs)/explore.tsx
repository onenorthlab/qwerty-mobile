import { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Button, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeView } from '../../shared/ui/SafeView';
import {
  findDictionary,
  getChapterCount,
  getChapterWords,
  useDictionarySelection,
} from '../../features/dictionary';
import { TypingScreen } from '../../features/typing';
import { useWordRecordsActions } from '../../features/progress';

export default function PracticeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [background, muted, accent] = useThemeColor([
    'background',
    'muted',
    'accent',
  ] as const);

  const { currentDictId, currentChapter } = useDictionarySelection();
  const [sessionId, setSessionId] = useState(0);
  const dict = findDictionary(currentDictId);
  const { recordSession } = useWordRecordsActions();

  const words = useMemo(
    () => (dict ? getChapterWords(dict.id, currentChapter) : []),
    [dict, currentChapter, sessionId],
  );

  const chapterCount = useMemo(
    () => (dict ? getChapterCount(dict.id) : 0),
    [dict],
  );

  useEffect(() => {
    setSessionId((n) => n + 1);
  }, [currentDictId, currentChapter]);

  if (!dict) {
    return (
      <SafeView edges={['top', 'left', 'right']}>
        <View
          testID="practice-empty"
          style={{ backgroundColor: background }}
          className="flex-1 items-center justify-center p-6"
        >
          <Text className="text-base mb-4" style={{ color: muted }}>
            {t('practice_no_dict')}
          </Text>
          <Button
            testID="practice-empty-go-home"
            variant="primary"
            onPress={() => router.push('/')}
          >
            {t('practice_go_home')}
          </Button>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <View
        testID="practice-screen"
        style={{ backgroundColor: background }}
        className="flex-1"
      >
        <View className="px-6 pt-6 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold" style={{ color: muted }}>
              {dict.name}
            </Text>
            <Text className="text-xs mt-1" style={{ color: muted, opacity: 0.6 }}>
              {t('practice_chapter_progress', {
                current: currentChapter + 1,
                total: chapterCount,
              })}
            </Text>
          </View>
          <Text className="text-xs" style={{ color: accent }}>
            {t('practice_session_length', { count: words.length })}
          </Text>
        </View>

        <TypingScreen
          key={`${dict.id}-${currentChapter}-${sessionId}`}
          words={words}
          accent={dict.defaultAccent}
          onExit={() => router.push('/')}
          onComplete={(mistakes) => {
            void recordSession({
              dictId: dict.id,
              chapter: currentChapter,
              results: words.map((w) => {
                const found = mistakes.find((m) => m.word === w.name);
                return {
                  word: w.name,
                  wrongCount: found?.attempts.length ?? 0,
                  mistakes: found?.attempts ?? [],
                  timingMs: null,
                };
              }),
            });
          }}
        />
      </View>
    </SafeView>
  );
}
