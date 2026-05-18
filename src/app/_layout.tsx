import '../../global.css';
import '../shared/lib/i18n';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { getLocales } from 'expo-localization';
import i18n from '../shared/lib/i18n';
import { RootProviders } from '../providers/RootProviders';
import { getStorage, setSyncStorage } from '../shared/lib/storage';
import { useSettingsStore } from '../features/settings/model/settings-store';
import { useUniwind } from 'uniwind';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [storageReady, setStorageReady] = useState(false);
  const { theme: resolvedTheme } = useUniwind();
  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    let isMounted = true;

    getStorage()
      .then((storage) => {
        setSyncStorage(storage);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) {
          setStorageReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync persisted language preference with i18next.
  // When language is 'system', apply the actual device locale via getLocales().
  const language = useSettingsStore((s) => s.language);
  useEffect(() => {
    if (!storageReady) return;
    if (language === 'system') {
      const locale = getLocales()[0]?.languageCode ?? 'en';
      void i18n.changeLanguage(locale.startsWith('zh') ? 'zh' : 'en');
    } else {
      void i18n.changeLanguage(language);
    }
  }, [language, storageReady]);

  useEffect(() => {
    if (storageReady && (fontsLoaded || fontsError)) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError, storageReady]);

  if (!storageReady || (!fontsLoaded && !fontsError)) return null;

  return (
    <RootProviders>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </RootProviders>
  );
}
