# Architecture — one-rn-starter2

## Feature-Sliced Design (FSD)

### Directory Rules

```
src/
├── app/          # Expo Router pages & layouts ONLY
│                 # No business logic here
├── features/     # Business domains
│   └── <name>/
│       ├── model/   # Zustand stores (persistent client state)
│       ├── lib/     # TanStack Query hooks, pure utils
│       ├── ui/      # Components only this feature needs
│       └── index.ts # Public exports — the only API surface
├── providers/    # React Context + SDK initialization
└── shared/       # Generic, reusable, no business knowledge
    ├── api/      # SDK clients (supabase singleton)
    ├── config/   # env.ts, features.ts
    ├── lib/      # Hooks, utilities, translations
    └── ui/       # Generic UI primitives (SafeView, etc.)
```

**Cross-feature imports:** Always through `features/<name>/index.ts`. Never directly import `features/a/lib/useX` from `features/b/`.

### Current Feature Modules

| Module | Contents |
|--------|----------|
| `features/settings` | Zustand settings store (theme, language, notificationsEnabled) |
| `features/notifications` | `useDevices` hooks for device CRUD via Supabase |
| `features/subscription` | RevenueCat entitlement, offerings, purchase mutations, PaywallScreen, EntitlementGate |

---

## Provider Tree

```
RootProviders
└── QueryProvider                  # TanStack Query + MMKV persistence
    └── AuthProvider               # Supabase session, signIn/signOut
        └── NotificationProvider   # OneSignal init + expo-notifications
            └── PurchaseProvider   # RevenueCat SDK init + user sync
                └── ThemeProvider  # React Navigation theme sync
                    └── GestureHandlerRootView
                        └── SafeAreaProvider
                            └── HeroUINativeProvider
                                └── BottomSheetModalProvider
                                    └── {children}
```

**Dependency order matters:** Auth must wrap Notification + Purchase so they can react to `user` changes. Query must be outermost for hooks inside all providers.

---

## Routing Structure

```
app/
├── _layout.tsx         # Root layout: font loading, storage init, splash
├── index.tsx           # Auth guard: → (tabs) if session, → (auth)/login if not
│                       # If FEATURES.AUTH=false: always → (tabs)
├── devices.tsx         # Device management (FEATURES.NOTIFICATIONS)
├── paywall.tsx         # IAP paywall (FEATURES.IAP)
├── (tabs)/
│   ├── _layout.tsx     # Tab bar: Home / Explore / Settings
│   │                   # Session check: if no session → (auth)/login
│   │                   # If FEATURES.AUTH=false: skip session check
│   ├── index.tsx       # Home screen
│   ├── explore.tsx     # Route explorer
│   └── settings.tsx    # Settings screen
└── (auth)/
    ├── _layout.tsx     # Auth stack
    └── login.tsx       # Email + Apple OAuth login
```

---

## Feature Flags

**Source of truth:** `src/shared/config/features.ts`

```typescript
export const FEATURES = {
  AUTH:          flag('EXPO_PUBLIC_FEATURE_AUTH'),
  NOTIFICATIONS: flag('EXPO_PUBLIC_FEATURE_NOTIFICATIONS'),
  IAP:           flag('EXPO_PUBLIC_FEATURE_IAP'),
} as const;
```

### Three Layers

| Layer | What it does | Requires rebuild? |
|-------|-------------|-------------------|
| UI | `{FEATURES.X && <Section />}` | No |
| Bundle | Conditional Provider in `RootProviders` via `MaybeX` | No |
| Native | Conditional plugin in `app.config.ts` | Yes (`npx expo prebuild`) |

### Dependency Chain

```
AUTH → required by → NOTIFICATIONS (OneSignal user ID sync)
AUTH → required by → IAP (RevenueCat user ID sync)
```

Disabling AUTH while leaving NOTIFICATIONS/IAP enabled → dev console warning.

### Default values

All flags default to `true` when env var is unset. `false` and `0` both disable.

---

## Storage Architecture

```
MMKV (encrypted, fast)
├── Zustand state (theme, language, notificationsEnabled)
├── TanStack Query cache (persisted via asyncStoragePersister)
└── Supabase auth tokens (via supabaseAuthStorage adapter)

expo-secure-store (keychain, small size limit)
└── MMKV encryption key
└── Device installation ID (deviceId.ts)
```

**Init sequence (app `_layout.tsx`):**
1. `getStorage()` → decrypts MMKV with SecureStore key
2. `setSyncStorage()` → makes MMKV synchronously accessible
3. Zustand rehydrates from MMKV
4. Splash screen hidden

---

## Theme System

- CSS variables in `global.css` — `@layer theme` block with `@variant light/dark`
- HeroUI Native's `useThemeColor(key)` reads CSS vars at runtime
- `useAppColors(keys)` — local hook for colors outside HeroUI's type union
- Prefer `style={{ color }}` over `className` for dynamic colors on icons
- Root container: `style={{ backgroundColor }}` (NOT `className`) — using className on root breaks child Text colors

---

## Auth Callback Deduplication

Android Expo Dev Client wraps OAuth callbacks. `src/shared/lib/auth-callback.ts` handles:
- Unwrapping Expo Dev Client wrapper URLs
- Short-time dedup window to prevent double session writes
- Distinguishing `?code=` (PKCE) vs `#access_token` (implicit) callback formats
