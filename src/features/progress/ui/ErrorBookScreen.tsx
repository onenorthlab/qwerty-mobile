import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { AlertCircle, BookOpenCheck } from 'lucide-react-native';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { useErrorWords } from '../lib/useWordRecords';
import { SafeView } from '../../../shared/ui/SafeView';

export function ErrorBookScreen() {
  const { t } = useTranslation();
  const [accent, muted, danger, success, surface, background] = useThemeColor([
    'accent',
    'muted',
    'danger',
    'success',
    'surface',
    'background',
  ] as const);
  const { rows, isLoading, reload } = useErrorWords();

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <View
        style={{ backgroundColor: background }}
        testID="errorbook-screen"
        className="flex-1"
      >
        <View className="px-6 pt-6 pb-3">
          <Text className="text-2xl font-bold" style={{ color: muted }}>
            {t('errorbook_title')}
          </Text>
          <Text className="text-sm mt-1" style={{ color: muted, opacity: 0.7 }}>
            {t('errorbook_subtitle')}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 gap-3"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={accent} />
          }
        >
          {rows.length === 0 ? (
            <View
              style={{ backgroundColor: surface }}
              className="rounded-2xl p-8 items-center mt-4"
              testID="errorbook-empty"
            >
              <BookOpenCheck size={48} color={success} strokeWidth={1.5} />
              <Text className="text-base font-semibold mt-3" style={{ color: muted }}>
                {t('errorbook_empty_title')}
              </Text>
              <Text className="text-sm mt-1 text-center" style={{ color: muted, opacity: 0.6 }}>
                {t('errorbook_empty_desc')}
              </Text>
            </View>
          ) : (
            rows.map((row) => (
              <View
                key={row.id}
                testID={`errorbook-row-${row.id}`}
                style={{ backgroundColor: surface }}
                className="flex-row items-center p-4 rounded-2xl"
              >
                <AlertCircle size={18} color={danger} strokeWidth={1.5} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold" style={{ color: muted }}>
                    {row.word}
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: muted, opacity: 0.6 }}>
                    {row.dict_id} · {t('errorbook_chapter', { chapter: row.chapter + 1 })}
                  </Text>
                </View>
                <Text className="text-sm" style={{ color: danger }}>
                  {row.wrong_count}×
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeView>
  );
}
