import { View, Text, ScrollView } from 'react-native';
import { Button, useThemeColor } from 'heroui-native';
import {
  Rocket, Palette, Shield, Zap, Lock, Database, Languages, KeyRound, Sun, Moon, Bell, Sparkles,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../shared/ui/SafeView';
import { useSettingsStore } from '../../features/settings/model/settings-store';
import { useAppColors } from '../../shared/lib/useAppColors';
import { FEATURES } from '../../shared/config/features';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme, setTheme } = useSettingsStore();
  const [accent, muted, success, warning, danger] = useThemeColor(['accent', 'muted', 'success', 'warning', 'danger'] as const);
  const [purple, cyan, pink, amber] = useAppColors(['purple', 'cyan', 'pink', 'amber'] as const);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        testID="home-screen"
        className="flex-1 bg-white dark:bg-gray-900"
        contentContainerClassName="items-center px-6 py-12"
      >
        <Rocket size={48} color={accent} strokeWidth={1.5} />
        <Text className="text-3xl font-bold text-primary-600 mt-4 mb-2">
          {t('appName')}
        </Text>
        <Text className="text-sm mb-8 text-gray-500 dark:text-gray-400">
          {t('subtitle')}
        </Text>

        <View className="w-full gap-3 mb-6">
          <FeatureCard icon={<Palette   size={24} color={accent}   strokeWidth={1.5} />} title={t('feature_tailwind')}    desc={t('feature_tailwind_desc')}    titleColor="text-primary-800" descColor="text-primary-600" />
          <FeatureCard icon={<Shield    size={24} color={success}  strokeWidth={1.5} />} title={t('feature_typescript')}  desc={t('feature_typescript_desc')}  titleColor="text-green-800"   descColor="text-green-600" />
          <FeatureCard icon={<Zap       size={24} color={warning}  strokeWidth={1.5} />} title={t('feature_heroui')}      desc={t('feature_heroui_desc')}      titleColor="text-amber-800"   descColor="text-amber-600" />
          <FeatureCard icon={<Lock      size={24} color={purple}   strokeWidth={1.5} />} title={t('feature_mmkv')}        desc={t('feature_mmkv_desc')}        titleColor="text-purple-800"  descColor="text-purple-600" />
          <FeatureCard icon={<Database  size={24} color={cyan}     strokeWidth={1.5} />} title={t('feature_state')}       desc={t('feature_state_desc')}       titleColor="text-cyan-800"    descColor="text-cyan-600" />
          <FeatureCard icon={<Languages size={24} color={pink}     strokeWidth={1.5} />} title={t('feature_i18n')}        desc={t('feature_i18n_desc')}        titleColor="text-pink-800"    descColor="text-pink-600" />
          {FEATURES.AUTH         && <FeatureCard icon={<KeyRound  size={24} color={amber}    strokeWidth={1.5} />} title={t('feature_supabase')}    desc={t('feature_supabase_desc')}    titleColor="text-orange-800"  descColor="text-orange-600" />}
          {FEATURES.NOTIFICATIONS && <FeatureCard icon={<Bell      size={24} color={danger}   strokeWidth={1.5} />} title={t('feature_onesignal')}   desc={t('feature_onesignal_desc')}   titleColor="text-red-800"     descColor="text-red-600" />}
          {FEATURES.IAP           && <FeatureCard icon={<Sparkles  size={24} color={warning}  strokeWidth={1.5} />} title={t('feature_revenuecat')}  desc={t('feature_revenuecat_desc')}  titleColor="text-amber-800"   descColor="text-amber-600" />}
        </View>

        {/* Theme toggle demo */}
        <View className="w-full rounded-2xl p-4 mb-6 bg-gray-50 dark:bg-gray-800">
          <Text className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
            {t('settings_theme')}: {theme}
          </Text>
          <Button testID="home-theme-toggle" variant="outline" className="w-full" onPress={toggleTheme}>
            <View className="flex-row items-center gap-2">
              {theme === 'dark'
                ? <Moon size={16} color={muted} strokeWidth={1.5} />
                : <Sun  size={16} color={muted} strokeWidth={1.5} />}
              <Text className="text-gray-900 dark:text-gray-200">
                Toggle Theme (persisted via MMKV)
              </Text>
            </View>
          </Button>
        </View>

        <Button testID="home-get-started" variant="primary" className="w-full">
          {t('getStarted')}
        </Button>
      </ScrollView>
    </SafeView>
  );
}

function FeatureCard({ icon, title, desc, titleColor, descColor }: {
  icon: React.ReactNode; title: string; desc: string; titleColor: string; descColor: string;
}) {
  return (
    <View className="flex-row items-center rounded-2xl p-4 bg-gray-50 dark:bg-gray-800">
      {icon}
      <View className="ml-3 flex-1">
        <Text className={`text-base font-semibold ${titleColor} dark:text-gray-100`}>{title}</Text>
        <Text className={`text-xs ${descColor} dark:text-gray-300`}>{desc}</Text>
      </View>
    </View>
  );
}
