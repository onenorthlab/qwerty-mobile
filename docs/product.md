# 产品问题记录

## Feature Flag 在 Release 包中失效

### 现象

将 `.env` 中的 `EXPO_PUBLIC_FEATURE_AUTH=false` 后，开发模式下登录页面正常跳过，但打包成 release APK 后依然显示登录页面，且没有"跳过"按钮。

### 根本原因

`features.ts` 原先用动态 key 读取环境变量：

```ts
const flag = (key: string): boolean =>
  process.env[key] !== 'false' && process.env[key] !== '0';
```

**React Native / Metro 只能在打包时静态替换 `process.env.EXPO_PUBLIC_XXX`（直接写出完整变量名的访问）。**  
动态访问 `process.env[key]`（key 是变量）无法被 Metro 识别，在 release bundle 中 `process.env` 是空对象 `{}`，所有 flag 均返回 `true`（即"已启用"），Feature Flag 形同虚设。

开发模式下不受影响，因为 Metro dev server 在运行时提供了完整的 `process.env`。

### 修复

将动态 key 改为每个变量静态访问：

```ts
// features.ts
export const FEATURES = {
  AUTH: process.env.EXPO_PUBLIC_FEATURE_AUTH !== 'false' && process.env.EXPO_PUBLIC_FEATURE_AUTH !== '0',
  NOTIFICATIONS: process.env.EXPO_PUBLIC_FEATURE_NOTIFICATIONS !== 'false' && process.env.EXPO_PUBLIC_FEATURE_NOTIFICATIONS !== '0',
  IAP: process.env.EXPO_PUBLIC_FEATURE_IAP !== 'false' && process.env.EXPO_PUBLIC_FEATURE_IAP !== '0',
} as const;
```

Metro 打包时会将每个 `process.env.EXPO_PUBLIC_*` 替换为 `.env` 文件中的字面量字符串，release 包中值正确。

### 附带修复

`(auth)/_layout.tsx` 原先只检查 Supabase session，未检查 `FEATURES.AUTH`，导致即使 `index.tsx` 跳过了登录，仍有可能进入 auth 路由组。修复方式：在 layout 顶部加守卫：

```tsx
if (!FEATURES.AUTH) return <Redirect href="/(tabs)" />;
```

### 规则

> 在 React Native 项目中，所有 `process.env` 访问必须使用静态 key（完整变量名），不能通过变量间接访问。否则 release 包中该值始终为 `undefined`。
