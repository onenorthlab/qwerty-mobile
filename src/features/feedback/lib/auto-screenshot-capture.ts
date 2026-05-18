import { useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { File } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as ScreenCapture from 'expo-screen-capture';

import type { PickedScreenshot, TranslationKey } from './widget';

/**
 * After the OS reports a screenshot the file isn't always indexed in
 * MediaLibrary yet. Retry with growing delays until it shows up — anything
 * captured 90s before detection is fair game.
 */
const RETRY_DELAYS_MS = [250, 600, 1200, 2000];
const LOOKBACK_WINDOW_MS = 90_000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface UseAutoScreenshotCaptureOptions {
  /** Master switch — pass FEATURES.FEEDBACK && configured. */
  enabled: boolean;
  /** Localised translator from the widget i18n module. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Called when a screenshot was successfully captured and read. */
  onCaptured: (screenshot: PickedScreenshot) => void;
  /**
   * Called when the user accepted the prompt but capture failed (denied
   * permission, asset not found, decode failed). Hosts can fall back to the
   * manual album picker here.
   */
  onFallback: () => void;
}

/**
 * Listens for system screenshot events and, after a short debounce, prompts
 * the user to attach the just-taken screenshot to a feedback report. On
 * confirm we pull the latest asset from MediaLibrary and hand it to the
 * caller as base64.
 *
 * Mirrors the original ExpoDemo implementation. Auto-capture is disabled on
 * web (no native API) and silently no-ops if either ScreenCapture or
 * MediaLibrary permissions are unavailable.
 */
export function useAutoScreenshotCapture(opts: UseAutoScreenshotCaptureOptions): void {
  const { enabled, t, onCaptured, onFallback } = opts;

  const isPromptActiveRef = useRef(false);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableRef = useRef(false);

  const captureFromMediaLibrary = useCallback(
    async (detectedAt: number): Promise<void> => {
      try {
        const perms = await MediaLibrary.getPermissionsAsync(false, ['photo']);
        if (!perms.granted) {
          const requested = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
          if (!requested.granted) {
            onFallback();
            return;
          }
        }

        let localUri: string | null = null;
        for (const delay of RETRY_DELAYS_MS) {
          await sleep(delay);
          const page = await MediaLibrary.getAssetsAsync({
            first: 30,
            mediaType: MediaLibrary.MediaType.photo,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            createdAfter: detectedAt - LOOKBACK_WINDOW_MS,
          });
          const latest =
            page.assets.find((a) => a.filename.toLowerCase().includes('screenshot')) ??
            page.assets[0];
          if (!latest) continue;

          const info = await MediaLibrary.getAssetInfoAsync(latest);
          localUri = info.localUri ?? info.uri ?? null;
          if (localUri) break;
        }

        if (!localUri) {
          onFallback();
          return;
        }

        // expo-file-system 55 deprecated the standalone readAsStringAsync —
        // it now throws when imported from the main package. Use the new
        // File class API which exposes a base64() method.
        const base64 = await new File(localUri).base64();
        if (!base64) {
          onFallback();
          return;
        }

        const mimeType = localUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        onCaptured({ base64, mimeType });
      } catch {
        // getAssetInfoAsync may fail without ACCESS_MEDIA_LOCATION on some
        // devices, or the file may not be readable yet. Fall back to letting
        // the user pick the screenshot manually from the system picker.
        onFallback();
      }
    },
    [onCaptured, onFallback],
  );

  // Probe ScreenCapture availability + ask permission on mount (Android 14+
  // requires runtime permission to detect screenshots).
  useEffect(() => {
    if (!enabled || Platform.OS === 'web') {
      availableRef.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const available = await ScreenCapture.isAvailableAsync();
        if (!available) {
          if (!cancelled) availableRef.current = false;
          return;
        }
        await ScreenCapture.requestPermissionsAsync();
        if (!cancelled) availableRef.current = true;
      } catch {
        if (!cancelled) availableRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Subscribe to screenshot events. Re-subscribes when the translator (and
  // therefore the visible Alert text) changes — e.g. on locale switch.
  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    const subscription = ScreenCapture.addScreenshotListener(() => {
      if (!availableRef.current) return;
      if (isPromptActiveRef.current) return;

      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
        promptTimerRef.current = null;
      }

      const detectedAt = Date.now();
      // Debounce: wait for the OS to write the screenshot to disk before we
      // try to read it. Without this the MediaLibrary lookup races and may
      // grab a stale photo or nothing.
      promptTimerRef.current = setTimeout(() => {
        isPromptActiveRef.current = true;
        Alert.alert(
          t('auto_capture_title'),
          t('auto_capture_message'),
          [
            {
              text: t('auto_capture_cancel'),
              style: 'cancel',
              onPress: () => {
                isPromptActiveRef.current = false;
              },
            },
            {
              text: t('auto_capture_confirm'),
              onPress: async () => {
                await captureFromMediaLibrary(detectedAt);
                isPromptActiveRef.current = false;
              },
            },
          ],
          {
            cancelable: true,
            onDismiss: () => {
              isPromptActiveRef.current = false;
            },
          },
        );
      }, 1200);
    });

    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
        promptTimerRef.current = null;
      }
      subscription.remove();
    };
  }, [enabled, t, captureFromMediaLibrary]);
}
