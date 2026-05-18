import { useUniwind } from 'uniwind';

/**
 * App-specific decorative icon colors not in HeroUI's palette.
 * Use `useThemeColor` from heroui-native for standard tokens (accent, success, warning, danger…).
 */
const COLORS = {
  light: { purple: '#7c3aed', cyan: '#0891b2', pink: '#db2777', amber: '#b45309' },
  dark:  { purple: '#a78bfa', cyan: '#22d3ee', pink: '#f472b6', amber: '#fbbf24' },
} as const;

type AppColorKey = keyof typeof COLORS.light;

export function useAppColors<T extends readonly [AppColorKey, ...AppColorKey[]]>(
  keys: T,
): { [K in keyof T]: string } {
  const { theme } = useUniwind();
  const palette = theme === 'dark' ? COLORS.dark : COLORS.light;
  return keys.map((k) => palette[k]) as unknown as { [K in keyof T]: string };
}
