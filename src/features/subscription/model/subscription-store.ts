import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../../../shared/lib/storage';

interface SubscriptionState {
  /** Timestamp (ms) of the last time the Paywall was shown. Used for cooldown. */
  lastPaywallShownAt: number | null;
  setLastPaywallShownAt: (ts: number) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      lastPaywallShownAt: null,
      setLastPaywallShownAt: (ts) => set({ lastPaywallShownAt: ts }),
    }),
    {
      name: 'subscription-store',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
