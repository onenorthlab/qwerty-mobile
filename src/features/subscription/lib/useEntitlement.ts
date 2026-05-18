import { useQuery } from '@tanstack/react-query';
import Purchases from 'react-native-purchases';
import { useAuth } from '@/providers/AuthProvider';
import { REVENUECAT_ENABLED } from './usePurchaseInit';

export const ENTITLEMENT_ID = 'pro';

export function useEntitlement() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['entitlements', user?.id],
    queryFn: () => Purchases.getCustomerInfo(),
    enabled: REVENUECAT_ENABLED && !!user?.id,
    staleTime: 1000 * 60,   // 1 minute
    gcTime: 0,              // Clear immediately on unmount (no cross-user pollution)
    retry: 1,
  });

  const isPro = !!query.data?.entitlements.active[ENTITLEMENT_ID]?.isActive;

  return {
    isPro,
    customerInfo: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
