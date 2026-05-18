# Test Results

**Date:** 2026-04-11  
**Branch:** main  
**Commit:** a541656 (Iter 7 — Supabase Auth)  
**Environment:** macOS 14, Node 20, Jest 30, jest-expo 55.0.15

---

## Summary

```
Test Suites: 6 passed, 6 total
Tests:       54 passed, 54 total
Snapshots:   0 total
Time:        ~1.7 s
```

**All 54 tests pass. Zero failures.**

---

## Detailed Results

### `env.test.ts` — Environment Variable Validation  4 tests, 0 failed

```
env validation schema
  ✓ parses valid Supabase URL and anon key (5 ms)
  ✓ defaults APP_ENV to development when unset (3 ms)
  ✓ accepts all three APP_ENV values (10 ms)
  ✓ treats missing Supabase vars as optional (no throw) (3 ms)
```

---

### `storage.test.ts` — MMKV Storage Adapters  9 tests, 0 failed

```
Storage module init
  ✓ getStorage returns same instance on multiple calls (singleton)

supabaseAuthStorage
  ✓ setItem and getItem round-trip
  ✓ removeItem deletes the key
  ✓ getItem returns null for missing key (1 ms)
  ✓ overwrites existing value on setItem

zustandStorage
  ✓ setItem and getItem round-trip
  ✓ removeItem deletes the key
  ✓ handles JSON-serializable objects
```

---

### `settings-store.test.ts` — Zustand Settings Store  11 tests, 0 failed

```
SettingsStore
  ✓ has correct default values
  ✓ setTheme updates the theme
  ✓ setTheme accepts light
  ✓ setTheme accepts dark
  ✓ setTheme accepts system
  ✓ setLanguage updates to en
  ✓ setLanguage updates to zh
  ✓ setLanguage updates to system
  ✓ setNotificationsEnabled to false
  ✓ setNotificationsEnabled to true
  ✓ resetSettings restores all defaults
```

---

### `i18n.test.ts` — Translation Files + i18next Runtime  14 tests, 0 failed

```
Translation files
  ✓ zh has all keys that en has (1 ms)
  ✓ en has all keys that zh has
  ✓ en translations are non-empty strings (2 ms)
  ✓ zh translations are non-empty strings (1 ms)
  ✓ en and zh have the same key count
  ✓ tab keys exist for all three tabs
  ✓ settings keys cover all setting sections
  ✓ feature cards have both title and description keys

i18n runtime
  ✓ i18n instance is defined
  ✓ has .t() function
  ✓ has .changeLanguage() function
  ✓ translates a known key in English (1 ms)
  ✓ translates a known key in Chinese
  ✓ falls back to English for unknown language
```

---

### `queryClient.test.ts` — TanStack Query Config  8 tests, 0 failed

```
queryClient configuration
  ✓ is a QueryClient instance
  ✓ staleTime is 5 minutes
  ✓ gcTime is 30 minutes
  ✓ retry is 2 for queries
  ✓ retry is 0 for mutations (no auto-retry)
  ✓ refetchOnWindowFocus is disabled (not applicable in RN)
  ✓ refetchOnReconnect is enabled

queryPersister
  ✓ is defined
```

---

### `supabase.test.ts` — Supabase Client + Auth Storage  9 tests, 0 failed

```
Supabase client
  ✓ exports a supabase client instance
  ✓ has auth.getSession method
  ✓ has auth.signInWithPassword method
  ✓ has auth.signOut method
  ✓ has auth.onAuthStateChange method
  ✓ has auth.signInWithOAuth method

supabaseAuthStorage (Supabase contract)
  ✓ stores and retrieves session JSON
  ✓ remove clears the stored session (1 ms)
  ✓ returns null for non-existent key
```

---

## Manual Verification (ADB Screenshot)

Screenshots taken after each iteration build on `Pixel_9_Pro_XL_API_35` AVD.

| Iteration | Feature | Status | Notes |
|---|---|---|---|
| Iter 1 | Tailwind + TypeScript | ✅ | App launches, styled correctly |
| Iter 2 | HeroUI + Reanimated | ✅ | Components render, no crash |
| Iter 3 | Dev Build | ✅ | Native build installs and runs |
| Iter 4 | MMKV + SecureStore | ✅ | Splash held, Inter font loaded |
| Iter 5 | Zustand + TanStack Query | ✅ | Theme toggle persists across restart |
| Iter 6 | i18n + Expo Router | ✅ | Tabs work, 中文 switching confirmed |
| Iter 7 | Supabase Auth | ✅ | Auth section shows "Not signed in" |

---

## Test Infrastructure Notes

### Expo SDK 55 Winter Runtime Issue

**Problem:** Expo SDK 55 installs lazy getters on `globalThis` for `__ExpoImportMetaRegistry` that fire dynamic `import()` calls when accessed. These fail in Jest's CommonJS/Babel mode with:
```
ReferenceError: You are trying to `import` a file outside of the scope of the test code.
```

**Root cause:** `expo/src/winter/installGlobal.ts` defines:
```javascript
Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
  get() { return require('./runtime.native'); },  // lazy
  configurable: true,
});
```
`runtime.native.ts` uses dynamic `import()` which is unsupported in CJS Jest.

**Fix applied in `jest.setup.js`:**
```javascript
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  value: { get: () => null, set: () => {} },
  writable: true, configurable: true,
});
```
This runs **after** jest-expo's preset setup (which installs the lazy getter), replacing it with a plain object.

### No Dynamic `import()` in Tests

All test files use static top-level `import` statements. Dynamic `await import(...)` is not supported in jest-expo's Babel/CJS transform mode without `--experimental-vm-modules`.

### Mock Variable Naming

Variables referenced inside `jest.mock()` factory callbacks must be prefixed with `mock` (case-insensitive). Example:
```typescript
const mockStore = new Map<string, string>();  // ✅ "mock" prefix
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn((key) => mockStore.get(key) ?? null),  // ✅ allowed
  })),
}));
```
