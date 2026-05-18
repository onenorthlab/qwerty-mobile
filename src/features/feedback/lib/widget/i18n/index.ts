import { en, type TranslationKey, type TranslationPack } from './en';

export type { TranslationKey, TranslationPack };

export interface I18nResolvedOptions {
  /** Effective locale chosen after fallback resolution (e.g. "zh-CN", "en"). */
  locale: string;
  /** Bound translator. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

function fillTemplate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) return String(vars[name]);
    return '{' + name + '}';
  });
}

/**
 * Locale priority: prop > deviceLocale (when supplied) > 'en'.
 * Lookup falls back from "zh-CN" → "zh" → English.
 */
export function resolveI18n(options: {
  locale?: string;
  deviceLocale?: string;
  extraTranslations?: Record<string, TranslationPack>;
}): I18nResolvedOptions {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const push = (loc: string | undefined) => {
    if (!loc) return;
    if (!seen.has(loc)) {
      candidates.push(loc);
      seen.add(loc);
    }
    const base = loc.split(/[-_]/)[0];
    if (base && base !== loc && !seen.has(base)) {
      candidates.push(base);
      seen.add(base);
    }
  };
  push(options.locale);
  push(options.deviceLocale);
  push('en');

  const packs = { ...options.extraTranslations };

  function lookup(key: TranslationKey): string {
    for (const candidate of candidates) {
      const pack = packs[candidate];
      if (pack && pack[key]) return pack[key]!;
    }
    return en[key];
  }

  const active = candidates.find((c) => packs[c] || c === 'en') ?? 'en';

  return {
    locale: active,
    t: (key, vars) => fillTemplate(lookup(key), vars),
  };
}
