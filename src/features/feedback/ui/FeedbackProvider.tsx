import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import * as Application from 'expo-application';
import { useTranslation } from 'react-i18next';

import { FEATURES } from '../../../shared/config/features';
import { env } from '../../../shared/config/env';
import { useAuth } from '../../../providers/AuthProvider';
import { useFeedbackDraftStorage } from '../lib/mmkv-storage-adapter';
import { pickScreenshotFromLibrary } from '../lib/pick-screenshot';
import { useAutoScreenshotCapture } from '../lib/auto-screenshot-capture';
import { resolveI18n, type PickedScreenshot } from '../lib/widget';
import { widgetExtraTranslations } from '../lib/translations';
import { FeedbackSheet } from './FeedbackSheet';

interface FeedbackContextValue {
  /** Open the feedback sheet from anywhere in the app. No-op when feature is off. */
  openSheet: () => void;
  /** Whether the FEEDBACK feature is fully wired (flag on + env present). */
  isAvailable: boolean;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  openSheet: () => {},
  isAvailable: false,
});

export function useFeedback(): FeedbackContextValue {
  return useContext(FeedbackContext);
}

/**
 * App-root provider for the feedback widget. Holds sheet visibility +
 * injected screenshot state, mounts the auto-capture listener, and renders
 * the sheet at the top of the tree so it can overlay any route.
 *
 * Settings entry (FeedbackSection) stays in the settings tab — it just
 * calls openSheet() through context.
 *
 * Hard short-circuits to `children` when the feature is disabled or env is
 * missing so we don't pay for permission prompts / native modules at all.
 */
export function FeedbackProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const storage = useFeedbackDraftStorage();

  const [open, setOpen] = useState(false);
  const [injectedScreenshot, setInjectedScreenshot] = useState<PickedScreenshot | null>(null);

  const featureOn = FEATURES.FEEDBACK;
  const relayEndpoint = env.FEEDBACK_RELAY_ENDPOINT;
  const apiKey = env.FEEDBACK_API_KEY;
  const isAvailable = featureOn && Boolean(relayEndpoint && apiKey);

  const openSheet = useCallback(() => {
    if (!isAvailable) return;
    setOpen(true);
  }, [isAvailable]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Drop the injected reference so a stale screenshot doesn't get
    // re-applied if the sheet is reopened later via the settings row.
    setInjectedScreenshot(null);
  }, []);

  const handleAutoCaptured = useCallback((screenshot: PickedScreenshot) => {
    setInjectedScreenshot(screenshot);
    setOpen(true);
  }, []);

  const handleAutoFallback = useCallback(async () => {
    // MediaLibrary path failed (no permission, no asset, decode error).
    // Fall back to the manual album picker the user can complete inside
    // the existing flow — same behaviour as the original demo.
    const picked = await pickScreenshotFromLibrary().catch(() => null);
    if (!picked) {
      // Still open the sheet so they can write feedback without a screenshot.
      setOpen(true);
      return;
    }
    setInjectedScreenshot(picked);
    setOpen(true);
  }, []);

  // Resolve widget i18n once for the auto-capture Alert. Sheet does its own
  // resolution; both read the same packs so they stay in sync.
  const { t: widgetT } = useMemo(
    () => resolveI18n({ locale: i18n.language, extraTranslations: widgetExtraTranslations }),
    [i18n.language],
  );

  useAutoScreenshotCapture({
    enabled: isAvailable,
    t: widgetT,
    onCaptured: handleAutoCaptured,
    onFallback: handleAutoFallback,
  });

  const ctx = useMemo<FeedbackContextValue>(
    () => ({ openSheet, isAvailable }),
    [openSheet, isAvailable],
  );

  if (!isAvailable) {
    if (__DEV__ && featureOn && !(relayEndpoint && apiKey)) {
      // One-off dev warn so misconfiguration is visible without crashing.
      console.warn(
        '[Feedback] FEATURES.FEEDBACK is on but EXPO_PUBLIC_FEEDBACK_RELAY_ENDPOINT ' +
          'and/or EXPO_PUBLIC_FEEDBACK_API_KEY are missing. Widget disabled.',
      );
    }
    return <FeedbackContext.Provider value={ctx}>{children}</FeedbackContext.Provider>;
  }

  const appId =
    env.FEEDBACK_APP_ID ?? Application.applicationId ?? 'com.unknown.app';
  const appVersion = Application.nativeApplicationVersion ?? '0.0.0';

  return (
    <FeedbackContext.Provider value={ctx}>
      {children}
      <FeedbackSheet
        visible={open}
        onClose={handleClose}
        appId={appId}
        appVersion={appVersion}
        relayEndpoint={relayEndpoint!}
        apiKey={apiKey!}
        userId={user?.id ?? null}
        email={user?.email ?? null}
        emailEditable={!user?.email}
        locale={i18n.language}
        storage={storage}
        pickScreenshot={pickScreenshotFromLibrary}
        injectedScreenshot={injectedScreenshot}
      />
    </FeedbackContext.Provider>
  );
}
