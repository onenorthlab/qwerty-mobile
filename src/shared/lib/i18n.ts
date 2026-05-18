/**
 * i18n — i18next + react-i18next, with MMKV-persisted language preference.
 * Falls back to device locale when language is set to 'system'.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './translations/en';
import zh from './translations/zh';

const deviceLang = getLocales()[0]?.languageCode ?? 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: deviceLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
