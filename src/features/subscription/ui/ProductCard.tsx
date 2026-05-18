import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  pkg: PurchasesPackage;
  badge?: string;
  highlighted?: boolean;
  onPress: () => void;
  isLoading?: boolean;
}

export function ProductCard({
  pkg,
  badge,
  highlighted = false,
  onPress,
  isLoading = false,
}: ProductCardProps) {
  const { t } = useTranslation();
  const [accent, success, muted] = useThemeColor(['accent', 'success', 'muted'] as const);

  const label = getPackageLabel(pkg.packageType, t);
  const period = getPackagePeriod(pkg.packageType, t);

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`rounded-2xl p-4 mb-3 border-2 ${
        highlighted
          ? 'bg-primary-50 dark:bg-primary-950 border-primary-500'
          : 'bg-gray-50 dark:bg-gray-800 border-transparent'
      }`}
    >
      {/* Badge */}
      {badge && (
        <View
          className="self-start px-2.5 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: highlighted ? accent : success }}
        >
          <Text className="text-xs font-semibold text-white">{badge}</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        {/* Left: title + period */}
        <View className="flex-1">
          <Text
            className={`text-base font-bold ${
              highlighted
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {label}
          </Text>
          <Text className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{period}</Text>
        </View>

        {/* Right: price + CTA */}
        <View className="items-end">
          <Text
            className={`text-lg font-bold ${
              highlighted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {pkg.product.priceString}
          </Text>
        </View>
      </View>

      {/* Purchase button */}
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        className={`mt-3 py-2.5 rounded-xl items-center justify-center ${
          highlighted ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={highlighted ? '#fff' : muted} />
        ) : (
          <Text
            className={`text-sm font-semibold ${
              highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {t('paywall_cta')}
          </Text>
        )}
      </Pressable>
    </Pressable>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPackageLabel(type: PACKAGE_TYPE, t: (k: string) => string): string {
  switch (type) {
    case PACKAGE_TYPE.MONTHLY:  return t('paywall_monthly');
    case PACKAGE_TYPE.ANNUAL:   return t('paywall_annual');
    case PACKAGE_TYPE.LIFETIME: return t('paywall_lifetime');
    default:                    return t('paywall_monthly');
  }
}

function getPackagePeriod(type: PACKAGE_TYPE, t: (k: string) => string): string {
  switch (type) {
    case PACKAGE_TYPE.MONTHLY:  return t('paywall_per_month');
    case PACKAGE_TYPE.ANNUAL:   return t('paywall_per_year');
    case PACKAGE_TYPE.LIFETIME: return t('paywall_one_time');
    default:                    return '';
  }
}
