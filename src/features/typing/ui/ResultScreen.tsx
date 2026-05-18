import { View, Text, ScrollView } from 'react-native';
import { CheckCircle2, RotateCw } from 'lucide-react-native';
import { Button, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { getSessionSummary } from '../model/selectors';
import type { TypingState } from '../model/types';

interface ResultScreenProps {
  state: TypingState;
  onRestart: () => void;
  onExit: () => void;
}

export function ResultScreen({ state, onRestart, onExit }: ResultScreenProps) {
  const { t } = useTranslation();
  const [accent, muted, success, danger, surface] = useThemeColor([
    'accent',
    'muted',
    'success',
    'danger',
    'surface',
  ] as const);

  const summary = getSessionSummary(state);
  if (!summary) {
    return null;
  }
  const accuracyPct = Math.round(summary.accuracy * 100);
  const seconds = Math.round(summary.durationMs / 1000);

  return (
    <ScrollView
      testID="result-screen"
      contentContainerClassName="px-6 py-8"
      className="flex-1"
    >
      <View className="items-center mb-6">
        <CheckCircle2 size={56} color={success} strokeWidth={1.5} />
        <Text className="text-2xl font-bold mt-3" style={{ color: muted }}>
          {t('result_title')}
        </Text>
        <Text className="text-sm mt-1" style={{ color: muted, opacity: 0.7 }}>
          {t('result_subtitle', { count: summary.totalWords })}
        </Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        <StatCard label={t('result_wpm')} value={`${summary.wpm}`} color={accent} surface={surface} muted={muted} />
        <StatCard label={t('result_accuracy')} value={`${accuracyPct}%`} color={success} surface={surface} muted={muted} />
        <StatCard label={t('result_time')} value={`${seconds}s`} color={accent} surface={surface} muted={muted} />
      </View>

      {summary.mistakes.length > 0 ? (
        <View
          testID="result-mistakes"
          style={{ backgroundColor: surface }}
          className="rounded-2xl p-4 mb-6"
        >
          <Text className="text-sm font-semibold mb-2" style={{ color: danger }}>
            {t('result_mistakes_header', { count: summary.mistakes.length })}
          </Text>
          {summary.mistakes.map((m) => (
            <View key={m.word} className="flex-row items-center py-2">
              <Text className="text-base font-medium flex-1" style={{ color: muted }}>
                {m.word}
              </Text>
              <Text style={{ color: muted, opacity: 0.6 }} className="text-xs">
                {m.attempts.length}× {t('result_mistakes_attempts')}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{ backgroundColor: surface }}
          className="rounded-2xl p-4 mb-6 items-center"
        >
          <Text className="text-sm" style={{ color: success }}>
            {t('result_no_mistakes')}
          </Text>
        </View>
      )}

      <Button
        testID="result-restart"
        variant="primary"
        onPress={onRestart}
        className="w-full mb-3"
      >
        <View className="flex-row items-center gap-2">
          <RotateCw size={16} color="white" strokeWidth={1.5} />
          <Text className="text-white">{t('result_restart')}</Text>
        </View>
      </Button>
      <Button
        testID="result-exit"
        variant="outline"
        onPress={onExit}
        className="w-full"
      >
        {t('result_back')}
      </Button>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  color,
  surface,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  surface: string;
  muted: string;
}) {
  return (
    <View
      style={{ backgroundColor: surface }}
      className="flex-1 rounded-2xl p-4 items-center"
    >
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-xs mt-1" style={{ color: muted, opacity: 0.7 }}>
        {label}
      </Text>
    </View>
  );
}
