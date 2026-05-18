import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Sparkles, Check } from 'lucide-react-native';
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '@/shared/ui/SafeView';
import { useOfferings } from '../lib/useOfferings';
import { usePurchase } from '../lib/usePurchase';
import { useRestorePurchases } from '../lib/useRestorePurchases';
import { ProductCard } from './ProductCard';

export function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [accent, muted, success] = useThemeColor(['accent', 'muted', 'success'] as const);

  const { data: offering, isLoading: offeringsLoading } = useOfferings();
  const purchase = usePurchase();
  const restore = useRestorePurchases();

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      await purchase.mutateAsync(pkg);
      router.back();
    } catch (e: any) {
      // User cancelled — no alert needed
      if (e?.userCancelled) return;
      Alert.alert(t('paywall_purchase_error'));
    }
  };

  const handleRestore = async () => {
    try {
      const info = await restore.mutateAsync();
      const hasActive = Object.keys(info.entitlements.active).length > 0;
      Alert.alert(
        hasActive ? t('paywall_restore_success') : t('paywall_restore_none'),
        undefined,
        [{ text: 'OK', onPress: () => { if (hasActive) router.back(); } }],
      );
    } catch {
      Alert.alert(t('paywall_restore_error'));
    }
  };

  // Sort packages: annual first (highlighted), then monthly, then lifetime
  const packages = sortPackages(offering?.availablePackages ?? []);

  const FEATURES = [
    t('paywall_feature_1'),
    t('paywall_feature_2'),
    t('paywall_feature_3'),
    t('paywall_feature_4'),
  ];

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        testID="paywall-screen"
        className="flex-1 bg-white dark:bg-gray-900"
        contentContainerClassName="px-6 pb-12"
      >
        {/* Close button */}
        <View className="flex-row justify-end pt-4 pb-2">
          <Pressable
            testID="paywall-close"
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <X size={20} color={muted} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900 items-center justify-center mb-4">
            <Sparkles size={32} color={accent} strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
            {t('paywall_title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            {t('paywall_subtitle')}
          </Text>
        </View>

        {/* Feature list */}
        <View className="mb-8 gap-3">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('paywall_features_title')}
          </Text>
          {FEATURES.map((f) => (
            <View key={f} className="flex-row items-center gap-3">
              <View
                className="w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: success }}
              >
                <Check size={12} color="#fff" strokeWidth={2.5} />
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-200 flex-1">{f}</Text>
            </View>
          ))}
        </View>

        {/* Products */}
        {offeringsLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={accent} />
            <Text className="text-sm text-gray-400 mt-3">{t('paywall_loading')}</Text>
          </View>
        ) : packages.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">{t('paywall_loading')}</Text>
          </View>
        ) : (
          <View className="mb-4">
            {packages.map((pkg) => (
              <ProductCard
                key={pkg.identifier}
                pkg={pkg}
                highlighted={pkg.packageType === PACKAGE_TYPE.ANNUAL}
                badge={getBadge(pkg.packageType, t)}
                onPress={() => handlePurchase(pkg)}
                isLoading={purchase.isPending && purchase.variables?.identifier === pkg.identifier}
              />
            ))}
          </View>
        )}

        {/* Restore */}
        <Pressable
          testID="paywall-restore"
          onPress={handleRestore}
          disabled={restore.isPending}
          className="items-center py-3"
        >
          <Text className="text-sm text-gray-400 dark:text-gray-500 underline">
            {restore.isPending ? t('paywall_restoring') : t('paywall_restore')}
          </Text>
        </Pressable>

        {/* Terms */}
        <Text className="text-xs text-center text-gray-300 dark:text-gray-600 mt-2">
          {t('paywall_terms')}
        </Text>
      </ScrollView>
    </SafeView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortPackages(pkgs: PurchasesPackage[]): PurchasesPackage[] {
  const order = [PACKAGE_TYPE.ANNUAL, PACKAGE_TYPE.MONTHLY, PACKAGE_TYPE.LIFETIME];
  return [...pkgs].sort((a, b) => {
    const ai = order.indexOf(a.packageType);
    const bi = order.indexOf(b.packageType);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function getBadge(type: PACKAGE_TYPE, t: (k: string) => string): string | undefined {
  if (type === PACKAGE_TYPE.ANNUAL)   return t('paywall_most_popular');
  if (type === PACKAGE_TYPE.LIFETIME) return t('paywall_best_value');
  return undefined;
}
