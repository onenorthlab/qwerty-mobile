import { useMutation, useQueryClient } from '@tanstack/react-query';
import Purchases from 'react-native-purchases';
import { REVENUECAT_ENABLED } from './usePurchaseInit';

export function useRestorePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!REVENUECAT_ENABLED) throw new Error('RevenueCat not configured');
      return Purchases.restorePurchases();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['entitlements'] });
    },
  });
}
