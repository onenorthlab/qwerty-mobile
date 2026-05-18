import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { env } from '@/shared/config/env';
import { FEATURES } from '@/shared/config/features';

export const REVENUECAT_ENABLED = !!(
  FEATURES.IAP &&
  (env.REVENUECAT_API_KEY_IOS || env.REVENUECAT_API_KEY_ANDROID)
);

/** Module-level guard: prevents re-configuration on Fast Refresh. */
let _initialized = false;

/**
 * Configure RevenueCat SDK. Safe to call multiple times — only runs once
 * per module lifecycle. No-op if API keys are not configured.
 */
export function initRevenueCat(): void {
  if (!REVENUECAT_ENABLED || _initialized) return;

  const apiKey = Platform.select({
    ios: env.REVENUECAT_API_KEY_IOS ?? '',
    android: env.REVENUECAT_API_KEY_ANDROID ?? '',
    default: '',
  });

  if (!apiKey) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // Use App Store (iOS) as the store — StoreKit 2 enabled on iOS 15+
  Purchases.configure({
    apiKey,
  });

  _initialized = true;
}
