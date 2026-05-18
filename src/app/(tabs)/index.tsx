import { View, Text, ScrollView } from 'react-native';
import { Headphones } from 'lucide-react-native';
import { Button, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeView } from '../../shared/ui/SafeView';
import { DictionaryPicker } from '../../features/dictionary';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [accent, muted, background] = useThemeColor([
    'accent',
    'muted',
    'background',
  ] as const);

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        testID="home-screen"
        style={{ backgroundColor: background }}
        contentContainerClassName="px-6 py-8 gap-6"
      >
        <View>
          <Text className="text-3xl font-bold" style={{ color: muted }}>
            {t('home_title')}
          </Text>
          <Text className="text-sm mt-1" style={{ color: muted, opacity: 0.7 }}>
            {t('home_subtitle')}
          </Text>
        </View>

        <DictionaryPicker onSelected={() => router.push('/explore')} />

        <Button
          testID="home-start-practice"
          variant="primary"
          className="w-full"
          onPress={() => router.push('/explore')}
        >
          <View className="flex-row items-center gap-2">
            <Headphones size={16} color="white" strokeWidth={1.5} />
            <Text className="text-white font-semibold">{t('home_start_practice')}</Text>
          </View>
        </Button>

        <Text className="text-xs text-center" style={{ color: accent, opacity: 0.6 }}>
          {t('home_footer_tip')}
        </Text>
      </ScrollView>
    </SafeView>
  );
}
