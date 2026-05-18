---
name: rn-posthog
description: AIHot Reader PostHog 集成规范。在 Expo / React Native 项目中接入 posthog-react-native，含 Provider 配置、环境变量管理、事件埋点及常见坑。
triggers:
  - "接入.*posthog"
  - "集成.*埋点"
  - "用户.*行为.*分析"
  - "posthog.*配置"
  - "analytics.*集成"
  - "事件.*追踪"
---

# AIHot Reader — PostHog RN 集成规范

## 安装

```bash
cd app
npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization
```

`expo-file-system`、`expo-application`、`expo-device`、`expo-localization` 是 `posthog-react-native` 在 Expo 项目中的必要 peer dependencies，缺少任何一个都会导致运行时报错。务必用 `npx expo install` 而非 `npm install`，前者会自动解析与当前 Expo SDK 版本兼容的包版本。

---

## 配置项一览

### 1. `.env` — 环境变量

```
# 运行时读取，必须加 EXPO_PUBLIC_ 前缀
EXPO_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

> `.env` 已在 `.gitignore` 中，不要 commit 真实值。

`EXPO_PUBLIC_POSTHOG_KEY` 和 `EXPO_PUBLIC_POSTHOG_HOST` 都是运行时需要的，必须加 `EXPO_PUBLIC_` 前缀才能在 app bundle 中读取。与 Sentry 的构建密钥不同，PostHog 没有需要保密的构建时密钥。

### 2. `src/providers/RootProviders.tsx` — Provider 注册

```tsx
import { PostHogProvider } from 'posthog-react-native';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY ?? 'disabled'}
      options={{
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
        defaultOptIn: !!process.env.EXPO_PUBLIC_POSTHOG_KEY,
      }}
    >
      <QueryProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryProvider>
    </PostHogProvider>
  );
}
```

`PostHogProvider` 必须是最外层，包住其他所有 Provider（含 QueryProvider、ThemeProvider 等），才能保证子树中所有组件都能通过 `usePostHog()` 拿到同一个实例。

### 3. 在组件中埋点

```tsx
import { usePostHog } from 'posthog-react-native';

function ArticleCard({ id, category }: { id: string; category: string }) {
  const posthog = usePostHog();

  function handleOpen() {
    posthog.capture('article_opened', { id, category });
    // 继续业务逻辑...
  }

  return <Pressable onPress={handleOpen}>...</Pressable>;
}
```

---

## 关键坑（踩过的）

### 坑 1：`PostHogProvider` 没有 `disabled` prop

PostHog 的 Provider 不像某些库那样支持直接传 `disabled={true}` 来关闭。
正确做法是通过 `options.defaultOptIn` 控制：

```tsx
// KEY 为空时静默 no-op，不上报任何数据
options={{ defaultOptIn: !!process.env.EXPO_PUBLIC_POSTHOG_KEY }}
```

`apiKey` 用 `?? 'disabled'` 兜底只是为了满足 TypeScript 的非空约束，`defaultOptIn: false` 才是真正阻止上报的开关。

### 坑 2：Provider 层级必须在最外层

`usePostHog()` 需要在 `PostHogProvider` 的子树内才能正常工作。如果 Provider 被错误地嵌套在 QueryProvider 或 ThemeProvider 内部，那些 Provider 的子组件（如全局 Toast、错误边界）就无法使用 PostHog，且报错信息不直观。正确做法：在 `RootProviders.tsx` 中把 `PostHogProvider` 放在最外层。

### 坑 3：必须用 `npx expo install` 安装 peer deps

`posthog-react-native` 的 peer deps（`expo-file-system` 等）有版本约束，直接用 `npm install` 容易装到不兼容的版本，导致构建失败或运行时崩溃。始终用 `npx expo install` 一次性安装所有包。

### 坑 4：Host 必须与项目创建时的区域匹配

- 美国区项目：`https://us.i.posthog.com`
- 欧盟区项目：`https://eu.i.posthog.com`

填错 host 不会报错，但事件会静默丢失，PostHog 控制台收不到任何数据，非常难排查。

### 坑 5：API Key 用 `phc_` 开头的项目密钥，不是个人 API Key

PostHog 控制台里有两种 key：
- **Project API Key**（`phc_` 前缀）：用于客户端 SDK 上报事件，填入 `.env`
- **Personal API Key**：用于后端 REST API 查询，不用于客户端

二者混用会导致鉴权失败，事件无法入库。

---

## 获取 `POSTHOG_KEY` 和 `POSTHOG_HOST`

1. 登录 [posthog.com](https://posthog.com)（或自托管地址）
2. 左侧边栏 → **Project Settings** → **Project API Key**
3. 复制 `phc_` 开头的 key，填入 `.env` 的 `EXPO_PUBLIC_POSTHOG_KEY`
4. 在同一页面确认项目所在区域（US / EU），对应填写 `EXPO_PUBLIC_POSTHOG_HOST`

---

## 自动采集能力

`posthog-react-native` 开箱即用，无需额外代码即可自动采集：

- **Screen views**：每次路由跳转自动记录页面名称
- **User sessions**：会话时长、冷启动 / 热启动
- **设备信息**：OS 版本、设备型号（来自 `expo-device`）
- **应用版本**（来自 `expo-application`）

手动 `posthog.capture()` 用于记录业务语义事件（如 `article_opened`、`category_switched`），与自动采集互补。

---

## 验证集成

```bash
# 本地 Metro 启动
cd app
npx expo start
```

打开 app 后，进入 PostHog 控制台 → **Activity** → **Live Events**，应能实时看到 `$screen` 等自动事件。若看不到，先检查：

1. `.env` 中的 key 和 host 是否正确
2. `defaultOptIn` 是否为 `true`（key 非空时应为 true）
3. 网络是否能访问 PostHog host（模拟器代理设置）

---

## 参考

- `app/src/providers/RootProviders.tsx` — PostHogProvider 注册位置
- `app/.env`（本地，不入 git）— POSTHOG_KEY 和 POSTHOG_HOST
- [posthog-react-native 官方文档](https://posthog.com/docs/libraries/react-native)
