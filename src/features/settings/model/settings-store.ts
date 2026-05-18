/**
 * Settings Store (Zustand v5)
 *
 * Persisted via MMKV-backed storage.
 * Manages: theme preference, language, notification settings.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../../../shared/lib/storage';

export type ThemePreference = 'light' | 'dark' | 'system';
export type LanguageCode = 'en' | 'zh' | 'system';

export interface SettingsState {
  theme: ThemePreference;
  language: LanguageCode;
  /** Master switch — false until user explicitly enables and grants OS permission */
  notificationsEnabled: boolean;

  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguageCode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const DEFAULT_STATE = {
  theme: 'system' as ThemePreference,
  language: 'system' as LanguageCode,
  notificationsEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),

      resetSettings: () => set(DEFAULT_STATE),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
