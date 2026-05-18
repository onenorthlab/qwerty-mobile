/**
 * Tests for Zustand settings store
 */

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn((key: string) => mockStore.get(key) ?? null),
    set: jest.fn((key: string, value: string) => { mockStore.set(key, value); }),
    remove: jest.fn((key: string) => { mockStore.delete(key); }),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('test-key'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
}));

import { useSettingsStore } from '../features/settings/model/settings-store';

describe('SettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
    mockStore.clear();
  });

  it('has correct default values', () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe('system');
    expect(state.language).toBe('system');
    expect(state.notificationsEnabled).toBe(true);
  });

  it('setTheme updates the theme', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('setTheme accepts light', () => {
    useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('setTheme accepts dark', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('setTheme accepts system', () => {
    useSettingsStore.getState().setTheme('system');
    expect(useSettingsStore.getState().theme).toBe('system');
  });

  it('setLanguage updates to en', () => {
    useSettingsStore.getState().setLanguage('en');
    expect(useSettingsStore.getState().language).toBe('en');
  });

  it('setLanguage updates to zh', () => {
    useSettingsStore.getState().setLanguage('zh');
    expect(useSettingsStore.getState().language).toBe('zh');
  });

  it('setLanguage updates to system', () => {
    useSettingsStore.getState().setLanguage('system');
    expect(useSettingsStore.getState().language).toBe('system');
  });

  it('setNotificationsEnabled to false', () => {
    useSettingsStore.getState().setNotificationsEnabled(false);
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it('setNotificationsEnabled to true', () => {
    useSettingsStore.getState().setNotificationsEnabled(true);
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
  });

  it('resetSettings restores all defaults', () => {
    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().setLanguage('zh');
    useSettingsStore.getState().setNotificationsEnabled(false);

    useSettingsStore.getState().resetSettings();

    const state = useSettingsStore.getState();
    expect(state.theme).toBe('system');
    expect(state.language).toBe('system');
    expect(state.notificationsEnabled).toBe(true);
  });
});
