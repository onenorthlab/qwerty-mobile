# OneRN Starter 2

> 生产级 React Native + Expo 起步模板。开箱即用的认证、推送、内购、主题、国际化完整集成。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 认证（可选）| Supabase 邮箱 + Apple Sign-In（iOS 原生）+ OAuth |
| 推送通知（可选）| OneSignal 远程推送 + expo-notifications 本地通知 + 设备管理 |
| 内购（可选）| RevenueCat IAP：月订阅 / 年订阅 / 终身，Paywall UI，权益门控 |
| 主题系统 | 浅色 / 深色 / 跟随系统，CSS 变量驱动，无硬编码颜色 |
| 国际化 | i18next，中英双语，跟随设备语言，运行时切换 |
| 状态管理 | Zustand v5 持久化 + TanStack Query v5 服务端状态 |
| 加密存储 | MMKV 加密本地存储 + SecureStore 密钥管理 |
| UI 组件库 | HeroUI Native + Lucide 图标 + Reanimated 动画 |
| E2E 测试 | Maestro 自动化测试，覆盖核心用户路径 |
| 功能开关 | 三个可选模块（AUTH / NOTIFICATIONS / IAP）均可独立关闭 |

---

## 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 运行时 | React Native | 0.83.4 |
| 框架 | Expo SDK | 55.0.13 |
| 语言 | TypeScript（严格模式） | 5.9.x |
| UI | React | 19.2.5 |
| 导航 | Expo Router | 7.x |
| 样式 | Tailwind CSS v4 + Uniwind | v4 |
| 组件库 | HeroUI Native | 1.0.x |
| 图标 | Lucide React Native | 1.8.x |
| 动画 | Reanimated | 4.2.1 |
| 存储 | MMKV + SecureStore | 4.x |
| 状态管理 | Zustand v5 | 5.x |
| 服务端状态 | TanStack Query v5 | 5.x |
| 表单 | React Hook Form + Zod | v7 + v4 |
| 国际化 | i18next + react-i18next | 26.x |
| 后端 | Supabase | 2.x |
| 推送（远程） | OneSignal v5 | 5.x |
| 推送（本地） | expo-notifications | 0.x |
| 内购 | RevenueCat SDK v9 | 9.x |

---

## 项目结构

```
src/
├── app/                    # Expo Router 文件路由
│   ├── _layout.tsx         # 根布局（字体、存储初始化、启动屏）
│   ├── index.tsx           # 根重定向（认证守卫）
│   ├── devices.tsx         # 设备管理页（需开启 NOTIFICATIONS）
│   ├── paywall.tsx         # 付费墙页（需开启 IAP）
│   ├── (tabs)/             # 已认证 Tab 区域
│   │   ├── _layout.tsx     # Tab 导航器（首页 / 探索 / 设置）
│   │   ├── index.tsx       # 首页
│   │   ├── explore.tsx     # 探索页
│   │   └── settings.tsx    # 设置页
│   └── (auth)/             # 未认证区域
│       └── login.tsx       # 登录页（邮箱 + Apple OAuth）
├── features/               # FSD 按功能模块划分
│   ├── settings/
│   │   └── model/settings-store.ts       # 主题 / 语言 / 通知偏好
│   ├── notifications/
│   │   └── lib/useDevices.ts             # 设备 CRUD（TanStack Query）
│   └── subscription/
│       ├── lib/                          # 权益 / 产品 / 购买 hooks
│       └── ui/PaywallScreen.tsx          # 付费墙 UI
├── providers/              # React Context + SDK 初始化
│   ├── RootProviders.tsx
│   ├── AuthProvider.tsx
│   ├── NotificationProvider.tsx
│   ├── PurchaseProvider.tsx
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
└── shared/                 # 跨模块通用代码
    ├── api/supabase.ts
    ├── config/
    │   ├── env.ts          # Zod 环境变量校验
    │   └── features.ts     # Feature Flags
    └── lib/
        ├── translations/   # en.ts + zh.ts
        └── storage.ts      # MMKV + SecureStore 适配器

supabase/
└── migrations/             # Supabase 数据库迁移文件
```

---

## 快速开始

### 前置条件

- Node.js 20+
- Xcode（iOS 开发）
- Android Studio + AVD（Android 开发）

> **注意：** 项目依赖原生模块（MMKV、gesture handler），**不支持 Expo Go**，需要使用 dev build。

### 安装

```bash
git clone <repo-url> my-app
cd my-app

npm install

cp .env.example .env
# 编辑 .env，至少填写 Supabase URL 和 anon key
```

### 运行

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# 真机（iOS）
npx expo run:ios --device
```

### 修改原生配置后重建

每次修改 `app.config.ts` 或 `.env` 中的 Feature Flag 后，需要重新 prebuild：

```bash
npx expo prebuild --platform ios
npx expo prebuild --platform android
```

### Android 手动打包（APK）

使用本地构建链路（不走 EAS 云构建）：

```bash
# 1) 生成 android 原生工程
APP_ENV=production npx expo prebuild --platform android --non-interactive

# 2) 构建 release APK
cd android
./gradlew assembleRelease
```

APK 输出目录：

```bash
android/app/build/outputs/apk/release/
```

### GitHub Actions 自动打包（APK）

项目已内置 workflow：

- `.github/workflows/android-apk.yml`

默认行为：

- 触发方式：`workflow_dispatch`、`push Release/release`（提交到 `Release` 或 `release` 分支时自动触发）
- 构建方式：`expo prebuild` + `./gradlew assembleRelease`
- 产物上传：`android/app/build/outputs/apk/release/*.apk`
- 模板仓库门禁：当前未启用（如需启用，可在 workflow 中恢复 `if: !github.event.repository.is_template`）
- 签名策略（自动检测）：
  - 4 个签名 Secrets 都存在：产出 signed APK
  - 4 个都不存在：产出 unsigned/default release APK
  - 只配置了部分 Secrets：workflow 直接失败并提示，避免误发包
- Node 版本兼容：已升级到 `actions/*@v5`；若第三方 Action 后续仍提示 Node 20，请等待其发布 Node 24 兼容版本或替换实现
- 缓存策略（加速且避免 prebuild 缺失报错）：
  - Node 依赖：`setup-node` 启用 npm cache + `npm ci --legacy-peer-deps`
  - Gradle 依赖：缓存 `~/.gradle/caches` 和 `~/.gradle/wrapper`（不依赖 `android/` 是否已生成）
  - Gradle 构建参数：`--parallel --build-cache`

### Android keystore（签名）流程

> 默认 `assembleRelease` 可能产出 unsigned APK。若要安装分发，建议开启 release 签名。

1. 生成 keystore（本地执行）：

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

2. 把 keystore 转成 Base64（用于 GitHub Secrets）：

```bash
base64 release.keystore | tr -d '\n'
```

3. 在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 新增以下 4 个 Secrets（要么全配，要么全不配）：

- `ANDROID_KEYSTORE_BASE64`：keystore 的 base64 文本
- `ANDROID_KEYSTORE_PASSWORD`：keystore 密码
- `ANDROID_KEY_ALIAS`：alias（如 `release`）
- `ANDROID_KEY_PASSWORD`：key 密码

4. 无需额外修改 workflow。当前 `.github/workflows/android-apk.yml` 已内置自动检测与条件构建逻辑。

5. 可在 Actions 日志中查看 `Detect signing config` 步骤确认实际使用的是 signed 或 unsigned 路径。

---

## 环境变量

复制 `.env.example` 为 `.env` 并填写：

| 变量名 | 必须 | 说明 |
|--------|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase anon（公开）密钥 |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID` | 可选 | OneSignal App ID（不填则远程推送静默关闭） |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` | 可选 | RevenueCat iOS Public SDK Key（`appl_` 开头） |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` | 可选 | RevenueCat Android Public SDK Key（`goog_` 开头） |
| `APPLE_TEAM_ID` | 真机必须 | Apple Developer Team ID（NSE 签名） |
| `EXPO_PUBLIC_APP_ENV` | 可选 | `development` / `staging` / `production` |

---

## 功能开关（Feature Flags）

三个可选功能模块可以通过环境变量独立关闭。不设置 = 默认开启。

```bash
# .env
EXPO_PUBLIC_FEATURE_AUTH=false          # 关闭则跳过登录，直接进入 tabs
EXPO_PUBLIC_FEATURE_NOTIFICATIONS=false # 关闭推送和设备管理
EXPO_PUBLIC_FEATURE_IAP=false           # 关闭内购和 Paywall
```

> **依赖关系：** NOTIFICATIONS 和 IAP 都依赖 AUTH 同步用户 ID。关闭 AUTH 时请同时关闭另外两个。

关闭通知功能后，如需从原生层移除 OneSignal（缩减包体积），需要重新 prebuild：

```bash
EXPO_PUBLIC_FEATURE_NOTIFICATIONS=false npx expo prebuild --platform ios
```

---

## 常用命令

```bash
# E2E 测试（需安装 Maestro）
npm run e2e                              # 运行全部 flows
npm run e2e:flow -- .maestro/flows/01-launch.yaml  # 运行单条

# 类型检查
npx tsc --noEmit
```

---

## 相关文档

| 文档 | 内容 |
|------|------|
| [docs/ui.md](./docs/ui.md) | 主题系统设计与颜色规范 |
| [docs/push.md](./docs/push.md) | OneSignal + expo-notifications 接入教程 |
| [docs/iap.md](./docs/iap.md) | RevenueCat 内购接入教程（含 App Store Connect 配置） |

---

## Legacy Web Reference (`legacy-web/`)

本仓库根目录的 [`legacy-web/`](./legacy-web/) 子目录是 [qwerty-learner](https://github.com/RealKai42/qwerty-learner)（原作者 [RealKai42](https://github.com/RealKai42)）网页版的完整代码与 git 历史归档，通过 `git subtree` 导入。

**用途与边界**：

- **只作功能参考**：本目录用于设计 qwerty-mobile 端口时查阅老 Web 版的产品行为、UI 交互、数据形态、词库结构。
- **本仓库主项目（根目录 `src/` 等）不会 `import` 此目录下任何文件**。所有功能在主项目里独立实现（clean-room rewrite）。
- **协议隔离**：`legacy-web/` 内代码继续遵循其原始 [GPL-3.0 协议](./legacy-web/LICENSE)；本仓库主项目代码（`src/` 等）独立实现、不衍生于上述代码，**不继承 GPL 协议**。
- **不修改**：`legacy-web/` 内文件不应被本仓库后续提交修改；如需 upstream 同步，使用 `git subtree pull` 而非散点编辑。

**词库与音频资产**：[`legacy-web/public/dicts/`](./legacy-web/public/dicts/) 下的 380 个词库 JSON 与 [`legacy-web/public/sounds/`](./legacy-web/public/sounds/) 下的音效文件，**其原始版权归各自来源所有**（CET 词表、公有领域词表、第三方贡献等不一而足）；在端口到 mobile 主项目使用前，每个文件的来源与许可证将单独审计。
