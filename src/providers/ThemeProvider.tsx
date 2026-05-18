/**
 * ThemeProvider — syncs Zustand theme preference with React Navigation theme.
 */
import {
  ThemeProvider as NavThemeProvider,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { Uniwind } from 'uniwind';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../features/settings/model/settings-store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore((s) => s.theme);

  const resolvedTheme =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  useEffect(() => {
    // Let Uniwind handle `system` so it can release Appearance overrides
    // and follow real OS theme changes.
    Uniwind.setTheme(themePreference);
  }, [themePreference]);

  const navTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;

  return <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>;
}
