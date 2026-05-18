/**
 * NotificationProvider — Push notification lifecycle management.
 *
 * - OneSignal v5 for remote push (graceful no-op without App ID)
 * - expo-notifications for local notifications, permissions, and foreground display
 * - Deep link routing with URL whitelist on notification tap
 * - User ID sync with OneSignal on auth state change
 * - Device registration to Supabase notification_devices table on login
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { env } from '../shared/config/env';
import { useAuth } from './AuthProvider';
import { useUpsertCurrentDevice } from '../features/notifications/lib/useDevices';
import { getDeviceInstallId } from '../shared/lib/deviceId';
import { FEATURES } from '../shared/config/features';

// ─── OneSignal (lazy import — only when App ID is configured) ────────────────

let OneSignal: typeof import('react-native-onesignal').OneSignal | null = null;
let OSLogLevel: typeof import('react-native-onesignal').LogLevel | undefined;

function getOneSignal() {
  if (!OneSignal) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('react-native-onesignal');
      OneSignal = mod.OneSignal ?? mod.default;
      OSLogLevel = mod.LogLevel;
    } catch {
      // SDK not installed or linking failed — will be null
    }
  }
  return OneSignal;
}

type ExpoNotificationsModule = typeof import('expo-notifications');
let ExpoNotifications: ExpoNotificationsModule | null | undefined;

function getExpoNotifications(): ExpoNotificationsModule | null {
  if (ExpoNotifications === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ExpoNotifications = require('expo-notifications') as ExpoNotificationsModule;
    } catch {
      ExpoNotifications = null;
      if (__DEV__ && FEATURES.NOTIFICATIONS) {
        console.warn(
          '[Notification] expo-notifications native module unavailable, notifications are disabled in this runtime.',
        );
      }
    }
  }
  return ExpoNotifications;
}

// ─── Deep Link Whitelist ─────────────────────────────────────────────────────

const ALLOWED_DEEP_LINK_PATTERNS = [
  /^\/(tabs)(\/.*)?$/,
  /^\/(tabs)$/,
  /^\/\(tabs\)(\/.*)?$/,
  /^\/settings$/,
  /^\/explore$/,
  /^\/paywall$/,
] as const;

function isAllowedDeepLink(url: string): boolean {
  // Strip scheme if present (e.g., "onern:///(tabs)/explore" → "/(tabs)/explore")
  let path = url;
  const schemeIdx = url.indexOf('://');
  if (schemeIdx !== -1) {
    path = url.slice(schemeIdx + 3);
    // Remove host if present
    if (path.startsWith('/')) {
      // already a path
    } else {
      const slashIdx = path.indexOf('/');
      path = slashIdx !== -1 ? path.slice(slashIdx) : '/';
    }
  }

  return ALLOWED_DEEP_LINK_PATTERNS.some((pattern) => pattern.test(path));
}

function handleDeepLinkNavigation(url: string | undefined) {
  if (!url) return;

  if (isAllowedDeepLink(url)) {
    // Strip scheme for router.push
    let path = url;
    const schemeIdx = url.indexOf('://');
    if (schemeIdx !== -1) {
      path = url.slice(schemeIdx + 3);
      if (!path.startsWith('/')) {
        const slashIdx = path.indexOf('/');
        path = slashIdx !== -1 ? path.slice(slashIdx) : '/';
      }
    }
    router.push(path as any);
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    // External URL — ask user before opening
    Alert.alert('Open Link', url, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => void Linking.openURL(url) },
    ]);
  }
}

// ─── Foreground display config ───────────────────────────────────────────────

const notifications = getExpoNotifications();
if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleLocalNotification: (opts: {
    title: string;
    body: string;
    hour: number;
    minute?: number;
    repeats?: boolean;
    data?: Record<string, unknown>;
  }) => Promise<string>;
  cancelLocalNotification: (id: string) => Promise<void>;
  cancelAllLocalNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const onesignalInitialized = useRef(false);
  const { mutate: upsertDevice } = useUpsertCurrentDevice();
  const notificationsApi = getExpoNotifications();

  // 1. OneSignal initialization (once)
  useEffect(() => {
    const appId = env.ONESIGNAL_APP_ID;
    const os = getOneSignal();

    if (!appId || !os) {
      if (__DEV__ && !appId) {
        console.log('[Notification] OneSignal App ID not configured — remote push disabled');
      }
      return;
    }

    if (onesignalInitialized.current) return;
    onesignalInitialized.current = true;

    if (__DEV__ && OSLogLevel) {
      os.Debug.setLogLevel(OSLogLevel.Verbose);
    }

    os.initialize(appId);
    console.log('[Notification] OneSignal initialized');
  }, []);

  // 2. User ID sync + device registration
  useEffect(() => {
    const os = getOneSignal();

    if (user?.id) {
      // Sync with OneSignal
      if (os && env.ONESIGNAL_APP_ID) {
        os.login(user.id);
        if (user.email) os.User.addEmail(user.email);
        console.log('[Notification] OneSignal user synced', user.id);
      }

      // Register device in Supabase
      void (async () => {
        const deviceId = await getDeviceInstallId();
        const oneSignalPlayerId = (() => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (os?.User as any)?.pushSubscription?.id ?? null;
          } catch {
            return null;
          }
        })();
        upsertDevice({ deviceId, oneSignalPlayerId });
      })();
    } else {
      if (os && env.ONESIGNAL_APP_ID) {
        os.logout();
        console.log('[Notification] OneSignal user logged out');
      }
    }
  }, [user?.id, user?.email, upsertDevice]);

  // 3. Check initial permission status
  useEffect(() => {
    if (!notificationsApi) return;
    notificationsApi.getPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, [notificationsApi]);

  // 4. OneSignal notification click → deep link
  useEffect(() => {
    const os = getOneSignal();
    if (!os || !env.ONESIGNAL_APP_ID) return;

    const handler = (event: any) => {
      const url = (event.notification?.additionalData as any)?.url as string | undefined;
      console.log('[Notification] OneSignal click', { url });
      handleDeepLinkNavigation(url);
    };

    os.Notifications.addEventListener('click', handler);
    return () => os.Notifications.removeEventListener('click', handler);
  }, []);

  // 5. Expo notification response (local notification taps)
  useEffect(() => {
    if (!notificationsApi) return;
    const subscription = notificationsApi.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url as string | undefined;
        console.log('[Notification] Expo response', { url });
        handleDeepLinkNavigation(url);
      },
    );
    return () => subscription.remove();
  }, [notificationsApi]);

  // 6. Cold start — handle last notification that opened the app
  useEffect(() => {
    if (!notificationsApi) return;
    notificationsApi.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const url = response.notification.request.content.data?.url as string | undefined;
      if (url) {
        console.log('[Notification] Cold start notification', { url });
        // Delay to ensure navigation is ready
        setTimeout(() => handleDeepLinkNavigation(url), 500);
      }
    });
  }, [notificationsApi]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!notificationsApi) {
      setHasPermission(false);
      return false;
    }
    // Request via expo-notifications (covers both OneSignal and local)
    const { status: existing } = await notificationsApi.getPermissionsAsync();
    if (existing === 'granted') {
      setHasPermission(true);
      return true;
    }

    const { status } = await notificationsApi.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);

    // Also request OneSignal permission
    const os = getOneSignal();
    if (os && env.ONESIGNAL_APP_ID && granted) {
      os.Notifications.requestPermission(true);
    }

    return granted;
  }, [notificationsApi]);

  const scheduleLocalNotification = useCallback(
    async (opts: {
      title: string;
      body: string;
      hour: number;
      minute?: number;
      repeats?: boolean;
      data?: Record<string, unknown>;
    }): Promise<string> => {
      if (!notificationsApi) {
        throw new Error('expo-notifications is unavailable in current runtime');
      }
      const id = await notificationsApi.scheduleNotificationAsync({
        content: {
          title: opts.title,
          body: opts.body,
          data: opts.data,
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId: 'reminders' }),
        },
        trigger: {
          type: notificationsApi.SchedulableTriggerInputTypes.DAILY,
          hour: opts.hour,
          minute: opts.minute ?? 0,
        },
      });
      console.log('[Notification] Scheduled local notification', { id, hour: opts.hour });
      return id;
    },
    [notificationsApi],
  );

  const cancelLocalNotification = useCallback(async (id: string) => {
    if (!notificationsApi) return;
    await notificationsApi.cancelScheduledNotificationAsync(id);
    console.log('[Notification] Cancelled notification', { id });
  }, [notificationsApi]);

  const cancelAllLocalNotifications = useCallback(async () => {
    if (!notificationsApi) return;
    await notificationsApi.cancelAllScheduledNotificationsAsync();
    console.log('[Notification] Cancelled all notifications');
  }, [notificationsApi]);

  // ─── Context value ─────────────────────────────────────────────────────

  const value = useMemo<NotificationContextValue>(
    () => ({
      hasPermission,
      requestPermission,
      scheduleLocalNotification,
      cancelLocalNotification,
      cancelAllLocalNotifications,
    }),
    [
      hasPermission,
      requestPermission,
      scheduleLocalNotification,
      cancelLocalNotification,
      cancelAllLocalNotifications,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
