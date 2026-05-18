import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../../features/settings/model/settings-store';

export function useResolvedTheme() {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore((s) => s.theme);

  const resolvedTheme =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  return {
    themePreference,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
  };
}
