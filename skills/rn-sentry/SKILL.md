---
name: rn-sentry
description: AIHot Reader Sentry 集成规范。在 Expo / React Native 项目中接入 @sentry/react-native，含 DSN 配置、导航追踪、EAS 密钥管理及常见坑。
triggers:
  - "接入.*sentry"
  - "集成.*监控"
  - "错误.*上报"
  - "sentry.*配置"
  - "崩溃.*追踪"
---

# AIHot Reader — Sentry RN 集成规范

## 安装

```bash
cd app
npx expo install @sentry/react-native
```

`@sentry/react-native` 版本约束：`~7.11.0`（与 Expo SDK 55 兼容）。

---

## 配置项一览

### 1. `app.config.ts` — Expo 插件

```ts
plugins: [
  // ...其他插件
  ['@sentry/react-native/expo', { url: 'https://sentry.io/' }],
]
```

### 2. `.env` — 环境变量

```
# 运行时读取，必须加 EXPO_PUBLIC_ 前缀
EXPO_PUBLIC_SENTRY_DSN=https://xxx@oXXXXXX.ingest.sentry.io/XXXXXXX

# 构建时读取，严禁加 EXPO_PUBLIC_ 前缀（否则会打进 bundle）
SENTRY_AUTH_TOKEN=sntrys_xxxxxx
```

> `.env` 已在 `.gitignore` 中，不要 commit 真实值。

### 3. `src/app/_layout.tsx` — SDK 初始化

```ts
import * as Sentry from '@sentry/react-native'
import { Stack, useNavigationContainerRef } from 'expo-router'

// ---- 模块级（组件外）----
const routingInstrumentation = Sentry.reactNavigationIntegration()

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN
const env = process.env.NODE_ENV ?? 'development'

Sentry.init({
  dsn,
  integrations: [routingInstrumentation],
  tracesSampleRate: env === 'production' ? 0.2 : 1.0,
  environment: env,
  enabled: !!dsn,   // DSN 未设置时静默 no-op，本地开发不报错
})

// ---- 组件内 ----
function RootLayout() {
  const ref = useNavigationContainerRef()

  useEffect(() => {
    routingInstrumentation.registerNavigationContainer(ref)
  }, [])

  return (
    <Stack>
      {/* ... */}
    </Stack>
  )
}

export default Sentry.wrap(RootLayout)
```

---

## 关键坑（踩过的）

### 坑 1：`SENTRY_AUTH_TOKEN` 绝对不能加 `EXPO_PUBLIC_` 前缀

`EXPO_PUBLIC_` 开头的变量会在构建时内联到 JS bundle 中，任何人反编译 APK/IPA 都能拿到。
`SENTRY_AUTH_TOKEN` 是上传 source map 的构建密钥，只在 `@sentry/react-native/expo` 插件的 postPublish hook 里使用，**不需要运行时可见**，因此：

- `.env` 里写 `SENTRY_AUTH_TOKEN=...`（无前缀）
- EAS 里也写 `SENTRY_AUTH_TOKEN`（见下方 EAS 配置节）

### 坑 2：`Stack` 不接受 `ref` / `onReady` props

Expo Router 的 `<Stack>` 不透传 `ref` 或 `onReady`，直接加会被忽略或报 TS 错。
正确做法：在 `useEffect` 中调用 `routingInstrumentation.registerNavigationContainer(ref)`，ref 来自 `useNavigationContainerRef()`。

### 坑 3：`Sentry.wrap()` 包的是函数，不是 JSX

```ts
// 正确
export default Sentry.wrap(function RootLayout() { ... })

// 错误——wrap 不接受 JSX 元素
export default Sentry.wrap(<RootLayout />)
```

### 坑 4：`enabled: !!dsn` 防止本地开发误报

没有 `.env` 文件时 `EXPO_PUBLIC_SENTRY_DSN` 为 `undefined`，`!!undefined === false`，Sentry SDK 不会初始化，也不会抛错。

---

## EAS 密钥配置

### 前置：确认项目已链接 EAS

```bash
cd app
eas init   # 如果 eas.json 中还没有 projectId
```

### 创建 EAS 环境变量（新 API，`eas secret:create` 已废弃）

```bash
eas env:create \
  --name SENTRY_AUTH_TOKEN \
  --value sntrys_xxxxxx \
  --environment production
```

`--environment` 可选值：`production` / `preview` / `development`。
如果需要三个环境都有，分别执行三次，或者不指定 `--environment`（全局变量）。

### 查看已有变量

```bash
eas env:list
```

---

## 获取 `SENTRY_AUTH_TOKEN`

1. 登录 [sentry.io](https://sentry.io)
2. 左侧边栏 → **Settings** → **Developer Settings** → **Auth Tokens**
3. 点击 **Organization Tokens**（推荐，不绑定个人账号，人员变动不影响 CI）
   - 不要用 Personal Tokens，团队场景容易因人员变更失效
4. 创建 token，勾选 scopes：
   - `project:releases`
   - `org:read`
5. 复制 token，写入 `.env` 和 EAS 变量

---

## 验证集成

```bash
# 本地 Metro 启动，查看 Sentry 初始化日志
cd app
npx expo start

# 在任意页面触发测试事件（开发环境）
Sentry.captureMessage('Sentry integration test')
```

Sentry 控制台 → Issues 看到事件即说明集成成功。

---

## 参考

- `app/src/app/_layout.tsx` — 实际集成代码
- `app/.env`（本地，不入 git）— DSN 和 AUTH_TOKEN
- `app/app.config.ts` — Expo 插件注册
