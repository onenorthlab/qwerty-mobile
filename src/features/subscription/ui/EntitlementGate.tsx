import { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { useEntitlement } from '../lib/useEntitlement';

interface EntitlementGateProps {
  children: ReactNode;
  /** Optional custom fallback instead of the default upgrade prompt */
  fallback?: ReactNode;
}

/**
 * Renders children for Pro users.
 * Free users see an upgrade prompt that navigates to /paywall.
 */
export function EntitlementGate({ children, fallback }: EntitlementGateProps) {
  const { isPro, isLoading } = useEntitlement();
  const router = useRouter();
  const { t } = useTranslation();
  const [accent, muted] = useThemeColor(['accent', 'muted'] as const);

  if (isLoading) return null;
  if (isPro) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <Pressable
      onPress={() => router.push('/paywall' as any)}
      className="rounded-2xl p-4 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 flex-row items-center gap-3"
    >
      <Sparkles size={20} color={accent} strokeWidth={1.5} />
      <View className="flex-1">
        <Text className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          {t('settings_upgrade')}
        </Text>
        <Text className="text-xs text-primary-500 dark:text-primary-400 mt-0.5">
          {t('settings_upgrade_desc')}
        </Text>
      </View>
    </Pressable>
  );
}
