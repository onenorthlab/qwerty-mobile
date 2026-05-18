import { useQuery } from '@tanstack/react-query';
import Purchases from 'react-native-purchases';
import { useAuth } from '@/providers/AuthProvider';
import { REVENUECAT_ENABLED } from './usePurchaseInit';

export function useOfferings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['offerings', user?.id],
    queryFn: () => Purchases.getOfferings(),
    enabled: REVENUECAT_ENABLED && !!user?.id,
    staleTime: 1000 * 60 * 5,  // 5 minutes — offerings change rarely
    retry: 1,
    select: (data) => data.current ?? null,
  });
}
