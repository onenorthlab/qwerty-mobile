# Test Plan

This document describes the automated test strategy, test structure, and manual verification plan for all 7 iterations of OneRN Starter.

---

## Test Philosophy

> Unit-test pure logic. Integration-test contracts. Manual-verify UI.

React Native components with heavy native dependencies are hard to unit-test without a device. The test strategy is:

1. **Unit tests** — pure TypeScript logic: storage adapters, Zustand store, i18n translations, env validation, query client config
2. **Contract tests** — verify that adapters (Supabase auth storage, Zustand storage) satisfy the interface contracts expected by their consumers
3. **Manual verification** — UI, navigation, animation, and native-dependent behavior verified via ADB screenshot after each iteration

---

## Test Stack

| Tool | Role |
|---|---|
| `jest` v30 | Test runner |
| `jest-expo` preset | Expo/RN transform + environment setup |
| `@testing-library/react-native` | Component testing utilities |
| TypeScript | All test files are `.test.ts` |

---

## Running Tests

```bash
# Run all tests once
npm test

# Run with coverage report
npm run test:coverage

# Watch mode (re-runs on file save)
npm run test:watch
```

---

## Test Suites

### `env.test.ts` — Environment Variable Validation

Tests the Zod schema in `src/shared/config/env.ts`.

| Test | What it verifies |
|---|---|
| Parses valid Supabase URL and anon key | Schema correctly reads `EXPO_PUBLIC_*` vars |
| Defaults APP_ENV to development | Missing env var falls back to `'development'` |
| Accepts all three APP_ENV values | `development`, `staging`, `production` all valid |
| Missing Supabase vars don't throw | Optional vars don't crash the app |

**Coverage:** schema parsing, default values, optional fields

---

### `storage.test.ts` — MMKV Storage Adapters

Tests `supabaseAuthStorage` and `zustandStorage` in `src/shared/lib/storage.ts`.

Native modules mocked:
- `react-native-mmkv` → in-memory `Map`
- `expo-secure-store` → returns a fixed encryption key
- `expo-crypto` → returns a fixed UUID

| Test | What it verifies |
|---|---|
| getStorage singleton | Same MMKV instance returned on repeat calls |
| supabaseAuthStorage set/get round-trip | Session JSON persists correctly |
| supabaseAuthStorage removeItem | Deleted key returns null |
| supabaseAuthStorage getItem for missing key | Returns null (not undefined) |
| supabaseAuthStorage overwrites on repeat set | Latest value wins |
| zustandStorage set/get round-trip | JSON objects serialize/deserialize correctly |
| zustandStorage removeItem | Key is deleted |
| zustandStorage handles complex objects | Nested JSON round-trips cleanly |

**Coverage:** all three exported adapters + singleton pattern

---

### `settings-store.test.ts` — Zustand Settings Store

Tests `useSettingsStore` in `src/features/settings/model/settings-store.ts`.

| Test | What it verifies |
|---|---|
| Default values | `theme: 'system'`, `language: 'system'`, `notificationsEnabled: true` |
| setTheme (light / dark / system) | Each value accepted and persisted |
| setLanguage (en / zh / system) | Each value accepted and persisted |
| setNotificationsEnabled toggle | Both `true` and `false` work |
| resetSettings restores defaults | All three fields reset together |

**Coverage:** all store actions, default state, reset behavior

---

### `i18n.test.ts` — i18n Translations + Runtime

Tests translation files (`en.ts`, `zh.ts`) and the `i18n` runtime instance.

| Test | What it verifies |
|---|---|
| zh has all keys that en has | No missing translations in Chinese |
| en has all keys that zh has | No extra keys in Chinese |
| en translations are non-empty strings | No blank/whitespace-only values |
| zh translations are non-empty strings | No blank/whitespace-only values |
| en and zh have same key count | Files stay in sync |
| Tab keys exist for all 3 tabs | `tab_home`, `tab_explore`, `tab_settings` defined |
| Settings keys cover all sections | All 12 settings keys present and non-empty |
| Feature cards have title+desc keys | All 7 feature cards have both keys |
| i18n instance is defined | Module exports correctly |
| `.t()` function exists | i18next API surface intact |
| `.changeLanguage()` function exists | Language switching available |
| Translates key in English | `tab_home` → `'Home'` |
| Translates key in Chinese | `tab_home` → `'首页'` |
| Falls back to English for unknown | `fr` language falls back to `en` |

**Coverage:** translation parity, i18next initialization, language switching

---

### `queryClient.test.ts` — TanStack Query Configuration

Tests `queryClient` in `src/shared/lib/queryClient.ts`.

| Test | What it verifies |
|---|---|
| Is a QueryClient instance | `getQueryData`, `invalidateQueries` methods exist |
| staleTime is 5 minutes | `5 * 60 * 1000 ms` |
| gcTime is 30 minutes | `30 * 60 * 1000 ms` |
| retry is 2 for queries | Auto-retry on network errors |
| retry is 0 for mutations | Mutations don't auto-retry |
| refetchOnWindowFocus disabled | Not applicable in React Native |
| refetchOnReconnect enabled | Refetches when network reconnects |
| queryPersister is defined | MMKV persister created successfully |

**Coverage:** all default query options, mutation options, persister

---

### `supabase.test.ts` — Supabase Client + Auth Storage

Tests `supabase` client in `src/shared/api/supabase.ts`.

| Test | What it verifies |
|---|---|
| Exports a client instance | Module exports correctly |
| auth.getSession() exists | Method available |
| auth.signInWithPassword() exists | Method available |
| auth.signOut() exists | Method available |
| auth.onAuthStateChange() exists | Method available |
| auth.signInWithOAuth() exists | Method available |
| supabaseAuthStorage stores session JSON | JWT tokens persist correctly |
| supabaseAuthStorage remove clears session | Logout clears tokens |
| supabaseAuthStorage returns null for missing | Correct null contract |

**Coverage:** Supabase client API surface, auth storage contract

---

## Manual Verification Checklist

These are verified via ADB screenshot after each iteration build.

### Iter 1 ✅ — Tailwind + TypeScript
- [ ] App launches without crash
- [ ] Tailwind utility classes render correctly
- [ ] TypeScript path alias `@/` resolves

### Iter 2 ✅ — HeroUI + Reanimated
- [ ] HeroUI `Button` renders with correct styles
- [ ] Lucide icons render
- [ ] No TurboModule crash on startup

### Iter 3 ✅ — Dev Build
- [ ] App installs and launches from dev build
- [ ] Metro bundler connects
- [ ] Hot reload works

### Iter 4 ✅ — MMKV + SecureStore
- [ ] Splash screen holds until storage ready
- [ ] Inter font loads (SemiBold visible in title)
- [ ] App restarts retain no visible state change (storage init silent)

### Iter 5 ✅ — Zustand + TanStack Query
- [ ] Theme toggle button visible on home screen
- [ ] Tapping toggle cycles: system → light → dark → system
- [ ] Theme persists after app restart (MMKV)
- [ ] "Zustand + TanStack Query + Zod" feature card visible

### Iter 6 ✅ — i18n + Routes
- [ ] Tab bar visible at bottom (Home / Explore / Settings)
- [ ] "i18n + Expo Router" feature card visible on Home tab
- [ ] Explore tab shows full route structure diagram
- [ ] Settings tab shows Theme / Language / Notifications sections
- [ ] Switching to 中文 updates Settings tab labels immediately
- [ ] Language preference persists after app restart

### Iter 7 ✅ — Supabase Auth
- [ ] "Supabase Auth" feature card visible on Home tab
- [ ] Settings tab shows Account section ("Not signed in")
- [ ] "Sign In" button navigates to Login screen
- [ ] Login screen shows email + password fields + GitHub OAuth button
- [ ] "Skip (Dev Mode)" button returns to tabs
- [ ] No crash when Supabase URL is placeholder (dev mode)

---

## E2E Tests (Maestro)

End-to-end tests using [Maestro](https://maestro.mobile.dev/) to automate UI interactions on a real device or simulator.

### Prerequisites

```bash
# Install Maestro CLI (macOS)
brew install maestro

# Ensure dev build is installed on simulator/emulator
# Bundle ID: com.onern.starter.dev
```

### Running E2E Tests

```bash
# Run all flows
npm run e2e

# Run a single flow
npm run e2e:flow -- .maestro/flows/01-launch-to-login.yaml
```

### Flow Overview

| Flow | Name | What it verifies |
|------|------|------------------|
| 01 | Launch → Login | Cold start lands on login screen with all elements visible |
| 02 | Dev Skip → Tabs | Skip button navigates to Home tab |
| 03 | Tab Navigation | Switching between Home, Explore, Settings tabs |
| 04 | Theme Toggle | Light / Dark / System theme chips in Settings |
| 05 | Language Switch | English ↔ Chinese language switching with text verification |
| 06 | Settings Reset | Change settings → Reset → verify defaults restored |
| 07 | Login Form | Email/password input, submit, toggle signup mode |
| 08 | Sign Out Flow | Unauthenticated state → Sign In navigates to login |

### Auth Strategy

All flows use the `__DEV__` mode "Skip" button to bypass authentication. This avoids dependency on Supabase network calls. Apple Sign-In is excluded (not automatable).

### testID Convention

All interactive elements are tagged with `testID` props following the pattern `{screen}-{element}`:
- `login-screen`, `login-email-input`, `login-skip-dev`, etc.
- `home-screen`, `home-theme-toggle`, `home-get-started`
- `explore-screen`
- `settings-screen`, `settings-theme-light`, `settings-lang-zh`, `settings-reset`, etc.

---

## Mock Strategy

All tests that touch native modules use a consistent mock pattern:

```typescript
// Variable must start with 'mock' to be accessible inside jest.mock() factory
const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn((key: string) => mockStore.get(key) ?? null),
    set: jest.fn((key: string, value: string) => { mockStore.set(key, value); }),
    remove: jest.fn((key: string) => { mockStore.delete(key); }),
  })),
}));
```

Native dependencies mocked:
- `react-native-mmkv` → in-memory `Map`
- `expo-secure-store` → returns fixed encryption key
- `expo-crypto` → returns fixed UUID
- `expo-localization` → returns `[{ languageCode: 'en', regionCode: 'US' }]`

---

## Known Test Infrastructure Notes

**Expo Winter Runtime (SDK 55):**

Expo SDK 55 installs lazy getters on `globalThis` for `__ExpoImportMetaRegistry` and `structuredClone` that fire dynamic `import()` calls. These fail in Jest's CommonJS mode. Fixed in `jest.setup.js`:

```javascript
// Override expo's lazy getter with a plain value
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  value: { get: () => null, set: () => {} },
  writable: true, configurable: true,
});
```

**Dynamic imports not supported:** All test files use static `import` statements (not `await import(...)`). The jest-expo preset uses Babel/CJS transform mode which doesn't support dynamic `import()`.
