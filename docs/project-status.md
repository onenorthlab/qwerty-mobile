# Project Status — one-rn-starter2

Last updated: 2026-04-14

## Implemented Features

| Feature | Status |
|---------|--------|
| Expo + TypeScript strict + Tailwind + Uniwind | ✅ |
| HeroUI Native + Lucide icons + Reanimated | ✅ |
| MMKV + SecureStore encrypted storage | ✅ |
| Zustand v5 + TanStack Query v5 + React Hook Form + Zod | ✅ |
| i18n (English + Chinese) + Expo Router file routing | ✅ |
| Supabase auth + Apple Sign-In + OAuth | ✅ |
| Theme system (light / dark / system) — CSS variable driven | ✅ |
| Maestro E2E testing | ✅ |
| Push notifications — OneSignal + expo-notifications + device management | ✅ |
| IAP — RevenueCat + Paywall UI + entitlement gating | ✅ |
| Feature Flags (AUTH / NOTIFICATIONS / IAP) | ✅ |
| Agent engineering — AGENTS.md + CLAUDE.md + .claude/ structure | ✅ |

---

## Feature Flags — Current State

All flags default to `true` when env var is absent.

| Flag | Default | What it controls |
|------|---------|-----------------|
| `EXPO_PUBLIC_FEATURE_AUTH` | true | Supabase auth, login screen, Account section |
| `EXPO_PUBLIC_FEATURE_NOTIFICATIONS` | true | OneSignal, local notifications, Devices screen |
| `EXPO_PUBLIC_FEATURE_IAP` | true | RevenueCat, Paywall, Pro section |

**Phase 1 (done):** UI-level gating only (conditional render in settings + home screens).

**Phase 2 (pending):** Bundle-level gating:
- No-op default contexts in AuthProvider + NotificationProvider
- MaybeX conditional provider wrappers in RootProviders
- `app/index.tsx` and `(tabs)/_layout.tsx` skip auth guard when `FEATURES.AUTH=false`

**Phase 3 (pending):** Native-level gating:
- `app.config.ts` conditional OneSignal plugins when `FEATURES.NOTIFICATIONS=false`
- Requires `npx expo prebuild` after flag change

---

## Environment Variables

```bash
# Required for auth
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Optional — silent degradation when absent
EXPO_PUBLIC_ONESIGNAL_APP_ID=          # Remote push disabled if unset
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=    # IAP disabled if unset (appl_...)
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID= # IAP disabled if unset (goog_...)

# Required for physical iOS builds (NSE signing)
APPLE_TEAM_ID=XXXXXXXXXX

# Optional feature flags (default: all enabled)
EXPO_PUBLIC_FEATURE_AUTH=false
EXPO_PUBLIC_FEATURE_NOTIFICATIONS=false
EXPO_PUBLIC_FEATURE_IAP=false
```

---

## Known Technical Decisions

- **`npm install --legacy-peer-deps`** — required for RN ecosystem peer dep conflicts
- **NSE auto-signing** — `plugins/withNSEAutoSigning.js` fixes OneSignal NSE provisioning on physical devices; requires `APPLE_TEAM_ID`
- **Apple brand icons** — lucide-react-native 1.8.x removed brand icons; Apple icon uses inline SVG
- **RevenueCat StoreKit 2** — enabled (`usesStoreKit2IfAvailable: true`) for iOS 15+
- **TanStack Query `gcTime: 0`** on entitlement — intentional, prevents cross-user entitlement leak after sign-out
- **MMKV v4** — `createMMKV()` API, `.remove()` not `.delete()`, async init required

---

## Pending / Future Work

- Feature Flags Phase 2 (Bundle-level: no-op contexts + MaybeX providers)
- Feature Flags Phase 3 (Native-level: conditional app.config.ts plugins)
- Android Google Sign-In (currently OAuth browser only)
- Push notification analytics / engagement tracking
- Crashlytics / error monitoring integration
