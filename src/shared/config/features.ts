/**
 * Feature Flags — centralized on/off switches for optional features.
 *
 * Set EXPO_PUBLIC_FEATURE_* = 'false' in .env to hide a feature.
 * Default: all enabled (no env var = true).
 *
 * Phase 1 (current): UI-level only — sections hidden, feature cards removed.
 * Phase 2 (future):  Provider-level — SDKs not initialized, native plugins
 *                    excluded from build (requires `npx expo prebuild`).
 *
 * Dependency chain:
 *   NOTIFICATIONS → depends on AUTH (user ID sync to OneSignal + device table)
 *   IAP           → depends on AUTH (user ID sync to RevenueCat)
 */

export const FEATURES = {
  /** Supabase auth — login screen, session guard, account section */
  AUTH:
    process.env.EXPO_PUBLIC_FEATURE_AUTH !== 'false' &&
    process.env.EXPO_PUBLIC_FEATURE_AUTH !== '0',
  /** OneSignal + expo-notifications — push permission, device management */
  NOTIFICATIONS:
    process.env.EXPO_PUBLIC_FEATURE_NOTIFICATIONS !== 'false' &&
    process.env.EXPO_PUBLIC_FEATURE_NOTIFICATIONS !== '0',
  /** RevenueCat — paywall, subscriptions, Pro entitlement */
  IAP:
    process.env.EXPO_PUBLIC_FEATURE_IAP !== 'false' &&
    process.env.EXPO_PUBLIC_FEATURE_IAP !== '0',
  /** FeedbackBridge widget — in-app feedback form that posts to a relay */
  FEEDBACK:
    process.env.EXPO_PUBLIC_FEATURE_FEEDBACK !== 'false' &&
    process.env.EXPO_PUBLIC_FEATURE_FEEDBACK !== '0',
} as const;

export type FeatureKey = keyof typeof FEATURES;

// Dev-time dependency warnings
if (__DEV__) {
  if (!FEATURES.AUTH && FEATURES.NOTIFICATIONS) {
    console.warn(
      '[Feature Flags] NOTIFICATIONS requires AUTH for user ID sync. ' +
        'Set EXPO_PUBLIC_FEATURE_NOTIFICATIONS=false as well, or implement anonymous user handling.',
    );
  }
  if (!FEATURES.AUTH && FEATURES.IAP) {
    console.warn(
      '[Feature Flags] IAP requires AUTH for entitlement sync. ' +
        'Set EXPO_PUBLIC_FEATURE_IAP=false as well.',
    );
  }
}
