/**
 * Tests for i18n — translation completeness and key correctness
 */

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
}));

import en from '../shared/lib/translations/en';
import zh from '../shared/lib/translations/zh';
import i18n from '../shared/lib/i18n';

type TranslationKeys = keyof typeof en;

describe('Translation files', () => {
  it('zh has all keys that en has', () => {
    const enKeys = Object.keys(en) as TranslationKeys[];
    const zhKeys = new Set(Object.keys(zh));
    const missing = enKeys.filter((k) => !zhKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('en has all keys that zh has', () => {
    const zhKeys = Object.keys(zh) as Array<keyof typeof zh>;
    const enKeys = new Set(Object.keys(en));
    const missing = zhKeys.filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('en translations are non-empty strings', () => {
    for (const [, value] of Object.entries(en)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
      expect(value).not.toMatch(/^\s*$/);
    }
  });

  it('zh translations are non-empty strings', () => {
    for (const [, value] of Object.entries(zh)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('en and zh have the same key count', () => {
    expect(Object.keys(en).length).toBe(Object.keys(zh).length);
  });

  it('tab keys exist for all three tabs', () => {
    expect(en.tab_home).toBeDefined();
    expect(en.tab_explore).toBeDefined();
    expect(en.tab_settings).toBeDefined();
  });

  it('settings keys cover all setting sections', () => {
    const settingsKeys: TranslationKeys[] = [
      'settings_title',
      'settings_theme',
      'settings_theme_light',
      'settings_theme_dark',
      'settings_theme_system',
      'settings_language',
      'settings_lang_en',
      'settings_lang_zh',
      'settings_lang_system',
      'settings_notifications',
      'settings_notifications_desc',
      'settings_reset',
    ];
    for (const key of settingsKeys) {
      expect(en[key]).toBeDefined();
      expect(en[key].length).toBeGreaterThan(0);
    }
  });

  it('feature cards have both title and description keys', () => {
    const features = ['tailwind', 'typescript', 'heroui', 'mmkv', 'state', 'i18n', 'supabase'];
    for (const f of features) {
      const titleKey = `feature_${f}` as TranslationKeys;
      const descKey = `feature_${f}_desc` as TranslationKeys;
      expect(en[titleKey]).toBeDefined();
      expect(en[descKey]).toBeDefined();
    }
  });
});

describe('i18n runtime', () => {
  it('i18n instance is defined', () => {
    expect(i18n).toBeDefined();
  });

  it('has .t() function', () => {
    expect(typeof i18n.t).toBe('function');
  });

  it('has .changeLanguage() function', () => {
    expect(typeof i18n.changeLanguage).toBe('function');
  });

  it('translates a known key in English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('tab_home')).toBe('Home');
  });

  it('translates a known key in Chinese', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('tab_home')).toBe('首页');
  });

  it('falls back to English for unknown language', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('tab_home')).toBe('Home'); // fallback
  });

  afterAll(async () => {
    // restore to English for other tests
    await i18n.changeLanguage('en');
  });
});
