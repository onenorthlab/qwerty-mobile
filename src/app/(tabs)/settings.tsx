import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Button, useThemeColor } from 'heroui-native';
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  ChevronRight,
  RotateCcw,
  LogOut,
  User,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { getLocales } from 'expo-localization';
import i18n from '../../shared/lib/i18n';
import { SafeView } from '../../shared/ui/SafeView';
import { useAuth } from '../../providers/AuthProvider';
import { useNotifications } from '../../providers/NotificationProvider';
import {
  useSettingsStore,
  type LanguageCode,
} from '../../features/settings/model/settings-store';
import { useAppColors } from '../../shared/lib/useAppColors';
import { useEntitlement } from '../../features/subscription/lib/useEntitlement';
import { FEATURES } from '../../shared/config/features';
import { FeedbackSection } from '../../features/feedback';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    theme,
    language,
    notificationsEnabled,
    setTheme,
    setLanguage,
    setNotificationsEnabled,
    resetSettings,
  } = useSettingsStore();

  const { requestPermission, cancelAllLocalNotifications } = useNotifications();
  const { isPro } = useEntitlement();

  const [accent, success, muted, danger] = useThemeColor(['accent', 'success', 'muted', 'danger'] as const);
  const [purple, cyan, amber] = useAppColors(['purple', 'cyan', 'amber'] as const);

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      // Turning ON — request OS permission first
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          t('settings_notifications'),
          t('settings_notifications_permission_denied'),
        );
        return;
      }
      setNotificationsEnabled(true);
    } else {
      // Turning OFF
      setNotificationsEnabled(false);
      await cancelAllLocalNotifications();
    }
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    if (lang === 'system') {
      const locale = getLocales()[0]?.languageCode ?? 'en';
      void i18n.changeLanguage(locale.startsWith('zh') ? 'zh' : 'en');
    } else {
      void i18n.changeLanguage(lang);
    }
  };

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        testID="settings-screen"
        className="flex-1 bg-white dark:bg-gray-900"
        contentContainerClassName="px-6 py-12"
      >
        <Text className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          {t('settings_title')}
        </Text>

        {/* Theme */}
        <SectionTitle
          icon={<Sun size={18} color={accent} />}
          title={t('settings_theme')}
        />
        <View className="flex-row gap-2 mb-6">
          <OptionChip
            testID="settings-theme-light"
            label={t('settings_theme_light')}
            icon={<Sun size={14} color={theme === 'light' ? '#fff' : muted} />}
            active={theme === 'light'}
            onPress={() => setTheme('light')}
          />
          <OptionChip
            testID="settings-theme-dark"
            label={t('settings_theme_dark')}
            icon={<Moon size={14} color={theme === 'dark' ? '#fff' : muted} />}
            active={theme === 'dark'}
            onPress={() => setTheme('dark')}
          />
          <OptionChip
            testID="settings-theme-system"
            label={t('settings_theme_system')}
            icon={<Monitor size={14} color={theme === 'system' ? '#fff' : muted} />}
            active={theme === 'system'}
            onPress={() => setTheme('system')}
          />
        </View>

        {/* Language */}
        <SectionTitle
          icon={<Globe size={18} color={success} />}
          title={t('settings_language')}
        />
        <View className="flex-row gap-2 mb-6">
          <OptionChip
            testID="settings-lang-en"
            label={t('settings_lang_en')}
            active={language === 'en'}
            onPress={() => handleLanguageChange('en')}
          />
          <OptionChip
            testID="settings-lang-zh"
            label={t('settings_lang_zh')}
            active={language === 'zh'}
            onPress={() => handleLanguageChange('zh')}
          />
          <OptionChip
            testID="settings-lang-system"
            label={t('settings_lang_system')}
            active={language === 'system'}
            onPress={() => handleLanguageChange('system')}
          />
        </View>

        {/* Notifications */}
        {FEATURES.NOTIFICATIONS && (
          <>
            <SectionTitle
              icon={<Bell size={18} color={purple} />}
              title={t('settings_notifications')}
            />
            <View className="rounded-xl mb-6 bg-gray-50 dark:bg-gray-800 overflow-hidden">
              {/* Master toggle */}
              <ToggleRow
                testID="settings-notifications-toggle"
                icon={<Bell size={16} color={notificationsEnabled ? purple : muted} />}
                label={t('settings_notifications_desc')}
                enabled={notificationsEnabled}
                onPress={handleNotificationToggle}
              />

              {/* Manage Devices — visible when master is on */}
              {notificationsEnabled && (
                <>
                  <View className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />
                  <Pressable
                    testID="settings-manage-devices"
                    className="flex-row items-center justify-between p-4"
                    onPress={() => router.push('/devices' as any)}
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-200">
                      {t('settings_manage_devices')}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-gray-400 dark:text-gray-500">
                        {t('settings_manage_devices_desc')}
                      </Text>
                      <ChevronRight size={16} color={muted} />
                    </View>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}

        {/* Pro */}
        {FEATURES.IAP && (
          <>
            <SectionTitle
              icon={<Sparkles size={18} color={amber} />}
              title={t('settings_pro')}
            />
            <View className="rounded-xl mb-6 bg-gray-50 dark:bg-gray-800 overflow-hidden">
              {isPro ? (
                /* Active state */
                <>
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: success }}
                      >
                        <Check size={14} color="#fff" strokeWidth={2.5} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {t('settings_pro_active')}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {t('settings_pro_active_desc')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />
                  <Pressable
                    testID="settings-manage-subscription"
                    className="flex-row items-center justify-between p-4"
                    onPress={() => router.push('/paywall' as any)}
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-200">
                      {t('settings_manage_subscription')}
                    </Text>
                    <ChevronRight size={16} color={muted} />
                  </Pressable>
                </>
              ) : (
                /* Upgrade prompt */
                <Pressable
                  testID="settings-upgrade-pro"
                  className="flex-row items-center justify-between p-4"
                  onPress={() => router.push('/paywall' as any)}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('settings_upgrade')}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('settings_upgrade_desc')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Sparkles size={14} color={amber} strokeWidth={1.5} />
                    <ChevronRight size={16} color={muted} />
                  </View>
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* Account */}
        {FEATURES.AUTH && (
          <>
            <SectionTitle icon={<User size={18} color={cyan} />} title="Account" />
            <View className="rounded-xl p-4 mb-6 bg-gray-50 dark:bg-gray-800">
              {user ? (
                <View>
                  <Text className="text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Signed in as: {user.email}
                  </Text>
                  <Button
                    testID="settings-sign-out"
                    variant="outline"
                    className="mt-2"
                    onPress={async () => {
                      await signOut();
                      router.replace('/(auth)/login');
                    }}
                  >
                    <View className="flex-row items-center gap-2">
                      <LogOut size={16} color={danger} strokeWidth={1.5} />
                      <Text className="text-red-500 font-medium">Sign Out</Text>
                    </View>
                  </Button>
                </View>
              ) : (
                <View>
                  <Text className="text-sm mb-2 text-gray-500 dark:text-gray-400">
                    Not signed in
                  </Text>
                  <Button
                    testID="settings-sign-in"
                    variant="outline"
                    onPress={() => router.push('/(auth)/login')}
                  >
                    <Text className="text-primary-500 font-medium">Sign In</Text>
                  </Button>
                </View>
              )}
            </View>
          </>
        )}

        {/* Feedback */}
        <FeedbackSection />

        {/* Reset */}
        <Button
          testID="settings-reset"
          variant="outline"
          className="w-full"
          onPress={() => {
            resetSettings();
            void i18n.changeLanguage('en');
          }}
        >
          <View className="flex-row items-center gap-2">
            <RotateCcw size={16} color={danger} strokeWidth={1.5} />
            <Text className="text-red-500 font-semibold">{t('settings_reset')}</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      {icon}
      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</Text>
    </View>
  );
}

function OptionChip({
  label,
  icon,
  active,
  onPress,
  testID,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full ${
        active ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-700'
      }`}
    >
      {icon}
      <Text
        className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600 dark:text-gray-200'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  subtitle,
  enabled,
  onPress,
  testID,
}: {
  icon?: React.ReactNode;
  label: string;
  subtitle?: string;
  enabled: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      className="flex-row items-center justify-between p-4"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3 flex-1 mr-3">
        {icon}
        <View className="flex-1">
          <Text className="text-sm text-gray-700 dark:text-gray-200">{label}</Text>
          {subtitle && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      <View
        className={`w-12 h-7 rounded-full justify-center ${
          enabled
            ? 'bg-primary-500 items-end'
            : 'bg-gray-300 dark:bg-gray-600 items-start'
        }`}
      >
        <View className="w-5 h-5 bg-white rounded-full mx-1" />
      </View>
    </Pressable>
  );
}
