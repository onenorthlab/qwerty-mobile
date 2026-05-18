# Apple Sign-In 配置与测试指南

> 本文档覆盖 Apple 开发者后台、Supabase Dashboard、Expo 项目配置，以及 iOS / Android 双平台的测试流程。

## 目录

1. [架构概览](#1-架构概览)
2. [Apple 开发者后台配置](#2-apple-开发者后台配置)
3. [Supabase Dashboard 配置](#3-supabase-dashboard-配置)
4. [Expo 项目配置](#4-expo-项目配置)
5. [iOS 测试流程](#5-ios-测试流程)
6. [Android 测试流程](#6-android-测试流程)
7. [Checklist](#7-checklist)
8. [常见问题排查](#8-常见问题排查)
9. [维护事项](#9-维护事项)

---

## 1. 架构概览

本项目对 Apple 登录采用**双平台差异化策略**：

| 平台 | 方式 | SDK 调用 | 需要浏览器？ |
|---|---|---|---|
| **iOS** | 原生 Apple Authentication | `signInWithIdToken()` | 否（系统弹窗） |
| **Android** | OAuth 浏览器流程 | `signInWithOAuth()` + `openAuthSessionAsync()` | 是 |

**iOS 流程：**
```
用户点击 → 系统原生弹窗（Face ID / Touch ID）
  → 获得 identityToken (JWT)
  → supabase.auth.signInWithIdToken({ provider: 'apple', token })
  → Session 建立，自动跳转主页
```

**Android 流程：**
```
用户点击 → supabase.auth.signInWithOAuth({ provider: 'apple' })
  → 获取 OAuth URL
  → WebBrowser.openAuthSessionAsync(url, redirectUri)
  → Apple 网页登录
  → 回调 onern://auth/callback#access_token=xxx&refresh_token=yyy
  → extractAndSetSession()
  → Session 建立，自动跳转主页
```

---

## 2. Apple 开发者后台配置

> 前提：需要 Apple Developer Program 会员（$99/年），角色为 Account Holder 或 Admin。

### 2.1 创建 App ID

1. 打开 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources)
2. 左侧导航 → **Identifiers**
3. 点击 **+** → 选择 **App IDs** → **App**
4. 填写：
   - Description: `OneRN Starter`
   - Bundle ID: **Explicit** → `com.onern.starter.dev`（与 `app.config.ts` 中的 `bundleIdentifier` 一致）
5. 在 Capabilities 列表中勾选 **✅ Sign in with Apple**
6. 点击 **Continue** → **Register**

> **注意：** 如果有多个环境（dev / staging / production），需要为每个 Bundle ID 分别注册 App ID 并启用该 capability。

### 2.2 创建 Services ID（仅 Android / Web 需要）

Services ID 用于 OAuth 浏览器流程（Android 和 Web 端）。如果只做 iOS 原生登录，可跳过此步。

1. **Identifiers** → **+** → 选择 **Services IDs**
2. 填写：
   - Description: `OneRN Supabase Login`
   - Identifier: `com.onern.starter.web`（不能与 App ID 相同）
3. 点击 **Continue** → **Register**
4. 回到列表，点击刚创建的 Services ID
5. 勾选 **✅ Sign in with Apple** → 点击 **Configure**
6. 在弹窗中配置：
   - **Primary App ID**: 选择上一步创建的 `com.onern.starter.dev`
   - **Domains**: 添加 `<your-project-id>.supabase.co`
   - **Return URLs**: 添加 `https://<your-project-id>.supabase.co/auth/v1/callback`
7. 点击 **Save** → **Continue** → **Save**

### 2.3 创建 Sign in with Apple 私钥

1. 左侧导航 → **Keys**
2. 点击 **+** 创建新 Key
3. 填写 Key Name: `Supabase Apple Auth`
4. 勾选 **✅ Sign in with Apple** → 点击 **Configure**
5. 选择 Primary App ID: `com.onern.starter.dev`
6. 点击 **Save** → **Continue** → **Register**
7. **立即下载 `.p8` 文件**（⚠️ 只能下载一次！）
8. 记录页面上显示的 **Key ID**（10 位字符）

> **⚠️ 重要：** `.p8` 文件一旦丢失无法重新下载，只能撤销 Key 重新创建。请妥善保管。

### 2.4 查找 Team ID

Team ID 在 Apple Developer 右上角 → **Membership Details** 中，是一个 10 位字符串（如 `HUJ6HAE4VU`）。

---

## 3. Supabase Dashboard 配置

### 3.1 启用 Apple Provider

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入项目 → **Authentication** → **Sign In / Providers**
3. 找到 **Apple** → 开启
4. 填写以下信息：

| 字段 | 值 | 来源 |
|---|---|---|
| **Client IDs** | 逗号分隔填写所有允许的 ID（Services ID + 各端 Bundle ID） | 步骤 2.1 / 2.2 |
| **Secret Key (for OAuth)** | 粘贴已生成的 Apple OAuth client secret（JWT 字符串） | 通过 Supabase 文档中的生成步骤创建 |

5. **Client IDs** 示例：
   - `com.onern.starter.web,com.onern.starter.dev,com.onern.starter.staging,com.onern.starter`
6. **Secret Key (for OAuth)** 说明：
   - 该字段是直接粘贴字符串，不是上传 `.p8` 文件。
   - 当前 Provider 表单里没有单独的 **Key ID** / **Team ID** 输入框。
   - `Key ID`、`Team ID` 和 `.p8` 文件用于前置生成 client secret（参考 Supabase 文档 `generate-a-client_secret`）。
   - 开发了一个在线工具，用于生成 client secret： <https://apple-oauth-tool.onenorthdev.com/>。
   - 源码在 one-rn-starter2/tools/apple-sign-in-secret-generator
7. 点击 **Save**

### 3.2 配置 Redirect URLs

1. **Authentication** → **URL Configuration**
2. 在 **Redirect URLs** 中添加：
   - `onern://auth/callback`（用于 Android OAuth 回调）
   - `onern://` （如需要更宽泛的匹配）

### 3.3 确保 Client IDs 覆盖 iOS Bundle ID（iOS 原生必需）

**这是关键步骤，很多教程遗漏：**

iOS 原生 `signInWithIdToken()` 传递的 token 中，audience 是 **App Bundle ID**（如 `com.onern.starter.dev`），而非 Services ID。

在新版 Supabase Apple Provider 配置中，这部分通过 **Client IDs** 统一维护。请确保其中包含所有 iOS Bundle ID：

```
com.onern.starter.dev,com.onern.starter.staging,com.onern.starter
```

如果不添加，iOS 端会报 `Invalid audience` 错误。

---

## 4. Expo 项目配置

### 4.1 依赖安装

```bash
npx expo install expo-apple-authentication expo-web-browser
```

### 4.2 app.config.ts 配置

```typescript
// 当前项目已配置好的关键字段：
export default ({ config }: ConfigContext): ExpoConfig => ({
  scheme: 'onern',                    // Deep link scheme，用于 OAuth 回调
  ios: {
    bundleIdentifier: 'com.onern.starter.dev',
    supportsTablet: false,
    // usesAppleSignIn: true,         // 如使用 EAS Build 需要添加
  },
  plugins: [
    'expo-web-browser',               // Android OAuth 浏览器
    'expo-apple-authentication',      // iOS 原生 Apple 登录
  ],
});
```

### 4.3 关键代码文件

| 文件 | 职责 |
|---|---|
| `src/providers/AuthProvider.tsx` | 认证状态管理 + `signInWithApple` 双平台实现 |
| `src/app/(auth)/login.tsx` | 登录页 UI |
| `src/shared/api/supabase.ts` | Supabase 客户端 |
| `src/app/index.tsx` | 认证守卫（未登录 → 重定向登录页） |

---

## 5. iOS 测试流程

### 5.1 环境要求

- macOS + Xcode（最新版）
- iOS 真机 **或** iOS 模拟器（有限制，见下方）
- Apple Developer 账号已完成步骤 2 的所有配置

### 5.2 构建 iOS Dev Build

```bash
# 方式一：本地构建（需要 Mac + Xcode）
npx expo run:ios

# 方式二：EAS Cloud Build（推荐，自动处理 capabilities）
eas build -p ios --profile development
```

> **注意：** 使用 `npx expo run:ios` 本地构建时，需要手动在 Xcode 中启用 **Sign in with Apple** capability：
> 1. 打开 `ios/OneRNStarter.xcworkspace`
> 2. 选择 Target → **Signing & Capabilities**
> 3. 点击 **+ Capability** → 搜索 **Sign in with Apple** → 添加

### 5.3 iOS 模拟器测试

| 功能 | 是否支持 |
|---|---|
| `signInAsync()` 弹窗 | ⚠️ 部分支持（无真实 Apple ID 交互） |
| `getCredentialStateForUser()` | ❌ 始终失败 |
| Face ID / Touch ID | ❌ 不可用 |
| 完整登录流程 | ❌ 无法获取真实 identityToken |

**结论：iOS 模拟器无法完成完整测试，必须使用真机。**

### 5.4 iOS 真机测试步骤

1. 确保设备已登录 Apple ID（设置 → Apple ID）
2. 安装 Dev Build 到设备
3. 打开 App → 进入登录页
4. 点击 **Continue with Apple**
5. 验证：
   - [ ] 系统弹出原生 Apple 登录弹窗
   - [ ] 显示"使用 [你的名字] 继续"
   - [ ] 可选择共享/隐藏邮箱
   - [ ] Face ID / Touch ID 验证
   - [ ] 登录成功，自动跳转到主页 Tab
   - [ ] 设置页显示登录邮箱
   - [ ] 退出登录后回到登录页

### 5.5 首次登录特殊行为

Apple **仅在首次授权时**返回用户全名。如需重新测试：

1. 设备 → 设置 → Apple ID → 密码与安全性 → 使用 Apple ID 的 App
2. 找到本 App → 点击 **停止使用 Apple ID**
3. 重新登录即可获得全名

---

## 6. Android 测试流程

### 6.1 环境要求

- Android 模拟器（API 28+）或 Android 真机
- 模拟器需要 Google Play Services（用于 Chrome 浏览器）
- Supabase Dashboard 已完成步骤 3 的所有配置（特别是 Services ID + Return URLs）

### 6.2 构建 Android Dev Build

```bash
# 生成 android/ 目录（如尚未生成）
npx expo prebuild

# 设置 SDK 路径
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# 构建并运行
npx expo run:android
```

### 6.3 Android 模拟器测试步骤

1. 启动模拟器（需有 Chrome 浏览器）
2. 安装并打开 App → 进入登录页
3. 点击 **Continue with Apple**
4. 验证：
   - [ ] 系统浏览器（Chrome Custom Tab）弹出
   - [ ] 跳转到 Apple 登录页（`appleid.apple.com`）
   - [ ] 输入 Apple ID + 密码
   - [ ] 完成双重认证（如已启用）
   - [ ] 浏览器自动关闭，回到 App
   - [ ] 登录成功，自动跳转到主页 Tab
   - [ ] 设置页显示登录邮箱

### 6.4 Android 常见问题

**问题：浏览器打开后显示 `Unsupported provider: provider is not enabled`**
- 原因：Supabase 后台未启用 Apple provider
- 解决：完成步骤 3.1

**问题：浏览器打开后显示 `invalid_client`**
- 原因：Services ID 或 Private Key 配置错误
- 解决：检查步骤 2.2 和 3.1 的配置

**问题：Apple 登录成功但浏览器未跳回 App**
- 原因：Redirect URL 未正确配置
- 解决：
  1. 检查 Supabase Dashboard → URL Configuration 是否添加了 `onern://auth/callback`
  2. 检查 Apple Developer → Services ID → Return URLs 是否添加了 `https://<project-id>.supabase.co/auth/v1/callback`

**问题：浏览器跳回 App 但未登录**
- 原因：Deep link handler 未正确提取 token
- 解决：检查 `AuthProvider.tsx` 中的 `extractAndSetSession` 函数

---

## 7. Checklist

### Apple Developer 后台

- [ ] 创建 App ID（`com.onern.starter.dev`）并启用 Sign in with Apple
- [ ] 创建 Services ID（`com.onern.starter.web`）
- [ ] Services ID 配置 Domain（`<project-id>.supabase.co`）
- [ ] Services ID 配置 Return URL（`https://<project-id>.supabase.co/auth/v1/callback`）
- [ ] 创建 `.p8` 私钥并安全保存
- [ ] 记录 Key ID 和 Team ID

### Supabase Dashboard

- [ ] 启用 Apple Provider
- [ ] 在 `Client IDs` 中填写 Services ID + iOS Bundle IDs（逗号分隔）
- [ ] 填写 `Secret Key (for OAuth)`（已生成的 client secret 字符串）
- [ ] Redirect URLs 添加：`onern://auth/callback`

### Expo 项目

- [ ] 安装 `expo-apple-authentication`
- [ ] 安装 `expo-web-browser`
- [ ] `app.config.ts` 添加两个 plugin
- [ ] `app.config.ts` 设置 `scheme: 'onern'`
- [ ] iOS 构建时启用 Sign in with Apple capability

### 测试验证

- [ ] iOS 真机：原生弹窗登录成功
- [ ] iOS：首次登录获取全名
- [ ] iOS：退出登录后回到登录页
- [ ] Android：浏览器 OAuth 流程完成
- [ ] Android：浏览器跳回 App 后自动登录
- [ ] Android：退出登录后回到登录页

---

## 8. 常见问题排查

| 错误信息 | 原因 | 解决方案 |
|---|---|---|
| `Unsupported provider: provider is not enabled` | Supabase 未启用 Apple provider | Dashboard → Authentication → Sign In / Providers → Apple → 启用 |
| `invalid_client` | Client IDs 或 Secret Key 配置错误 | 检查 Supabase 中的 `Client IDs` 与 `Secret Key (for OAuth)` |
| `Invalid audience` | iOS Bundle ID 未添加到 Client IDs | Supabase Apple Provider → `Client IDs` 添加对应 Bundle ID |
| `makeRedirectUri is not a function` | 错误使用了 `expo-linking` 的 API | 改用直接拼接 redirect URI：`'onern://auth/callback'` |
| Apple 登录弹窗不出现（iOS） | 未启用 Sign in with Apple capability | Xcode → Signing & Capabilities → 添加 |
| 浏览器登录后未跳回 App | Redirect URL 配置不匹配 | 检查 Apple Developer + Supabase 两处配置 |
| 首次登录拿不到全名 | 之前已授权过该 App | 设备设置 → Apple ID → 停止使用，再重试 |
| `.p8` 文件丢失 | 创建后未及时下载 | 只能撤销旧 Key，重新创建 |

---

## 9. 维护事项

### 9.1 密钥轮换（每 6 个月）

Apple OAuth 使用的 client secret 有效期最长 **6 个月**。仅影响 **Android / Web 的 OAuth 流程**，iOS 原生登录不受影响。

**轮换步骤：**

1. Apple Developer → Keys → 创建新 Key（勾选 Sign in with Apple）
2. 下载新 `.p8` 文件
3. 使用新 `.p8`、Key ID、Team ID 重新生成 client secret
4. Supabase Dashboard → Apple Provider → 更新 `Secret Key (for OAuth)`
5. 确认 Android 登录正常后，删除旧 Key

> **建议：** 在日历中设置提醒，或在 CI/CD 中添加过期检测。

### 9.2 多环境管理

| 环境 | Bundle ID | 需要独立 App ID？ | 需要独立 Services ID？ |
|---|---|---|---|
| Development | `com.onern.starter.dev` | 是 | 可共用 |
| Staging | `com.onern.starter.staging` | 是 | 可共用 |
| Production | `com.onern.starter` | 是 | 可共用 |

所有环境的 Bundle ID 都需要添加到 Supabase 的 **Client IDs** 中。

---

## 参考资料

- [Supabase: Login with Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Supabase: signInWithIdToken API](https://supabase.com/docs/reference/javascript/auth-signinwithidtoken)
- [Expo: Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Expo: iOS Capabilities](https://docs.expo.dev/build-reference/ios-capabilities/)
- [Apple: Register a Services ID](https://developer.apple.com/help/account/identifiers/register-a-services-id/)
- [Apple: Create Sign in with Apple Private Key](https://developer.apple.com/help/account/capabilities/create-a-sign-in-with-apple-private-key/)
