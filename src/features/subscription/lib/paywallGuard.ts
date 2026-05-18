import { useSubscriptionStore } from '../model/subscription-store';

const PAYWALL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Returns whether the paywall may be shown (respects 7-day cooldown)
 * and a function to record the current display timestamp.
 */
export function usePaywallGuard() {
  const { lastPaywallShownAt, setLastPaywallShownAt } = useSubscriptionStore();

  const canShow =
    !lastPaywallShownAt || Date.now() - lastPaywallShownAt > PAYWALL_COOLDOWN_MS;

  const markShown = () => setLastPaywallShownAt(Date.now());

  return { canShow, markShown };
}
