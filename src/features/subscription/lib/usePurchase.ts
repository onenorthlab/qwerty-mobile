import { useMutation, useQueryClient } from '@tanstack/react-query';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { REVENUECAT_ENABLED } from './usePurchaseInit';

export function usePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (!REVENUECAT_ENABLED) throw new Error('RevenueCat not configured');
      return Purchases.purchasePackage(pkg);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['entitlements'] });
    },
  });
}
