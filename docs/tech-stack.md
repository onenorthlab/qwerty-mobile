# Tech Stack — one-rn-starter2

Complete dependency inventory as of round 13.

## Core Runtime

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React Native | 0.83.4 |
| Framework | Expo SDK | 55.0.13 |
| Language | TypeScript (strict) | 5.9.x |
| UI Library | React | 19.2.5 |
| Router | Expo Router | 7.x (v55) |

## Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` + `uniflow` (Uniwind) | v4 | Utility-first CSS |
| `heroui-native` | 1.0.x | Component library |
| `lucide-react-native` | 1.8.x | Icons (brand icons removed in 1.8) |
| `react-native-reanimated` | 4.2.1 | Animations |
| `react-native-gesture-handler` | — | Gesture system (required by HeroUI) |
| `@gorhom/bottom-sheet` | — | Bottom sheet modals |
| `react-native-safe-area-context` | — | Safe area insets |

## State Management & Data

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | v5 | Client state (persisted to MMKV) |
| `@tanstack/react-query` | v5 | Server state + caching |
| `react-hook-form` | v7 | Form state |
| `zod` | v4 | Schema validation (forms + env vars) |

## Storage

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-mmkv` | v4 | Fast encrypted local storage |
| `expo-secure-store` | — | Encryption key storage + sensitive data |
| `expo-crypto` | — | Encryption key generation |

**MMKV v4 API note:** Uses `createMMKV()` (not constructor), `.remove()` (not `.delete()`). Requires async init before Zustand hydration.

## Internationalization

| Package | Version | Purpose |
|---------|---------|---------|
| `i18next` | 26.x | i18n core |
| `react-i18next` | — | React bindings |
| `expo-localization` | — | Device language detection |

Supported languages: English (`en`), Chinese Simplified (`zh`), System (follows device).

## Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | 2.x | Auth + database + realtime |
| `expo-web-browser` | — | OAuth popup |
| `expo-apple-authentication` | — | Native Apple Sign-In (iOS only) |

## Push Notifications

| Package | Version | Purpose |
|---------|---------|---------|
| `onesignal-react-native` | v5 | Remote push notifications |
| `expo-notifications` | 0.x | Local notifications + foreground handling |
| `onesignal-expo-plugin` | — | app.config.ts integration |
| `plugins/withNSEAutoSigning.js` | local | NSE target auto-signing fix |

**NSE signing:** Requires `APPLE_TEAM_ID` in `.env` for physical device builds.

## In-App Purchases

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-purchases` | v9.x | RevenueCat SDK (StoreKit 2 enabled) |

No Expo Config Plugin needed for RevenueCat.

**Product IDs (App Store):**
- `com.onern.starter.monthly_pro`
- `com.onern.starter.annual_pro`
- `com.onern.starter.lifetime_pro`
- Entitlement: `pro` | Offering: `default`

## Dev Tooling

| Package | Purpose |
|---------|---------|
| `maestro` | E2E testing (mobile flows) |
| `expo-font` | Font loading |
| `expo-splash-screen` | Controlled splash screen |

## Bundle IDs by Environment

| Environment | Bundle ID |
|-------------|-----------|
| development | `com.onern.starter.dev` |
| staging | `com.onern.starter.staging` |
| production | `com.onern.starter` |

## Install Note

```bash
npm install --legacy-peer-deps
```
Required due to peer dependency conflicts in the RN ecosystem. Do not use `--force`.
