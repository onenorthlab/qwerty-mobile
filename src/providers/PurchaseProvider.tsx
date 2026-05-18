import { useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { useAuth } from './AuthProvider';
import { initRevenueCat, REVENUECAT_ENABLED } from '../features/subscription/lib/usePurchaseInit';

/**
 * Initializes the RevenueCat SDK and keeps the SDK user in sync
 * with the Supabase auth user.
 *
 * Must be placed inside <AuthProvider> so useAuth() is available.
 */
export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // One-time SDK initialization (Fast Refresh safe — guarded by module-level flag)
  useEffect(() => {
    initRevenueCat();
  }, []);

  // Sync RevenueCat user with auth state
  useEffect(() => {
    if (!REVENUECAT_ENABLED) return;

    if (user?.id) {
      Purchases.logIn(user.id).catch((e) => {
        if (__DEV__) console.warn('[RC] logIn failed:', e);
      });
    } else {
      // logOut throws if no user is logged in — suppress that error
      Purchases.logOut().catch(() => {});
    }
  }, [user?.id]);

  return <>{children}</>;
}
