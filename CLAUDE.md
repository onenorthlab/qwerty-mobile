# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库背景（先读这一段）

本仓库是 **qwerty-mobile**——把 [qwerty-learner](https://github.com/RealKai42/qwerty-learner) 网页版 APP 化的 React Native + Expo 55 项目，基于 OneRN Starter 2 模板。老 Web 版以 `git subtree` 形式归档在 `legacy-web/`，**只读不动**。

**P0 协议边界（D4）**：主项目（`src/`）**永远不能 `import` 任何 `legacy-web/` 路径下的文件**。`legacy-web/` 是 GPL-3.0，主项目不继承该协议。`legacy-web/` 仅作为产品行为/数据形态的查阅参考，端口时一律在 `src/` 下做 clean-room 重写。详见 `README.md#Legacy-Web-Reference`。

**锁定的架构决策 D1–D8**（合并形态 / git 历史 / Push 策略 / GPL 边界 / 输入交互 / 资产分发 / MVP 后端 / Phase 3 后端）记录在项目 plan 文件：
`/home/aiwork/.claude/plans/templates-cloudflare-verser-verser-clou-bubbly-kite.md`
后续讨论或 PR 描述里引用 D# 编号，不要重新打开决策窗口。

---

## 协作规范

通用 Agent 规则在 **AGENTS.md**（i18n key zh+en 必须同步、所有 Pressable/Button/TextInput 须有 `testID`、颜色禁止硬编码必须走 `useThemeColor`/`useAppColors`、HeroUI Native 优先、FSD 模块只能通过 `index.ts` 跨边界、TypeScript 严格不允许 `any`）。动 `src/` 前重读一遍。

自定义 Agent Skills 在 `.agents/skills/`，共 10 个：`rn-architect` / `rn-reviewer` / `debug-detective` / `learner` / `tech-researcher` / `ux-mobile` / `security-researcher` / `create-feature` / `create-screen` / `add-translation`。Claude Code 通过 `.claude` 软链发现，**首次 clone 后必须跑一次** `npm run skills:link`（否则上述 10 个 skill 不可见）。

---

## 常用命令

```bash
# 安装（RN 0.83 + React 19 组合，必须带 legacy-peer-deps）
npm install --legacy-peer-deps

# Dev build（修改 app.config.ts、Feature Flag、原生依赖后需要 prebuild）
npx expo run:ios
npx expo run:android
npx expo prebuild --platform <ios|android>

# 测试
npm test                                      # 全量 Jest
npm test -- src/__tests__/storage.test.ts     # 单文件
npm run test:watch
npm run test:coverage

# E2E（需先安装 Maestro CLI）
npm run e2e                                   # 跑 .maestro/flows/ 全部
npm run e2e:flow -- .maestro/flows/01-launch.yaml

# 类型检查（仓库无 ESLint / Prettier 配置，TS 是唯一静态检查）
npx tsc --noEmit

# 本地 Android 出 release APK（CI 走 .github/workflows/android-apk.yml）
APP_ENV=production npx expo prebuild --platform android --non-interactive
cd android && ./gradlew assembleRelease

# 启用 .agents/skills 发现（创建 .claude → .agents 软链，已被 .gitignore 忽略）
npm run skills:link
```

仓库**没有 lint 工具**——`tsc --noEmit` + Jest + Maestro 三件套是全部静态/动态保障。

---

## 架构鸟瞰

**FSD 目录边界**（详见 `docs/architecture.md`）：
- `src/app/` 只放 Expo Router 文件路由和布局，不放业务逻辑
- `src/features/<name>/` 垂直切片（`model/` Zustand store + `lib/` Query hooks/工具 + `ui/` 专属组件），跨 feature 调用**必须**经 `index.ts`
- `src/providers/` React Context + SDK 初始化（顺序：`QueryProvider` → `AuthProvider` → `NotificationProvider` → `PurchaseProvider` → `ThemeProvider` → `GestureHandlerRootView` → `SafeAreaProvider` → `HeroUINativeProvider` → `BottomSheetModalProvider` → `FeedbackProvider`）
- `src/shared/` 跨模块通用代码：`config/env.ts`（Zod 校验环境变量）、`config/features.ts`（Feature Flags）、`lib/storage.ts`（MMKV + SecureStore 适配器）、`lib/translations/{en,zh}.ts`

**存储分层**：
- 敏感数据（token、session）→ `expo-secure-store`，经 `src/shared/lib/storage.ts` 的适配器
- App 状态（设置、Query 缓存持久化）→ `react-native-mmkv`
- 关系数据（Phase 2 引入）→ `expo-sqlite`，从 day one 就带 sync-ready 三列：`uuid` / `updated_at` / `deleted_at`

**Feature Flags**（`src/shared/config/features.ts`）：`FEATURE_AUTH` / `FEATURE_NOTIFICATIONS` / `FEATURE_IAP`，MVP 阶段三个全关（D7）。依赖关系：`NOTIFICATIONS` 和 `IAP` 都依赖 `AUTH`（要用 user.id 同步）。Hooks 必须无条件调用——关闭的 Provider 提供 no-op 默认值。

**后端立场**：
- **MVP（当前）**：无后端。本地 MMKV + `expo-sqlite` + Cloudflare Pages 托管词库 JSON + Youdao 公共 TTS API。
- **Phase 3（远期，已定）**：混合方案——Supabase 只做 Auth（220 LOC 已跑通，含 Apple Sign-In Native + Email + PKCE），Cloudflare D1/R2/Workers/Pages 接管 DB + 静态 + API（D8）。**不要再评估纯 Cloudflare DIY Auth 方案**。

Supabase 当前在模板里只有 549 LOC：220 LOC Auth + 1 张 `notification_devices` 表（5 个 CRUD），无 Realtime / Storage / Edge Functions。详细清单：`/home/aiwork/.claude/projects/-home-aiwork-project-qwerty/memory/supabase_footprint.md`。

---

## UI 规则（最常被违反，单独提一遍）

新页面/组件**优先用 HeroUI Native**：`Card` / `Button` / `TextField` / `TextArea` / `ListGroup` / `Switch` / `Chip` / `Alert` / `Dialog` / `Toast` / `Separator` / `Tabs` / `Accordion` / `Avatar` / `Select` / `RadioGroup` / `Surface`。仅当 HeroUI 没有对应组件时才回退到 `View` + Tailwind。

常见违反（必须避免）：
- 按钮用 `Pressable` + 自写 rounded/bg → 改 `Button`
- 卡片用 `<View className="rounded-xl p-4 bg-surface">` → 改 `Card` 或 `Surface`
- toggle 手写 → 改 `Switch`；裸 `TextInput` → 改 `TextField`
- 列表用一堆 `Pressable` → 改 `ListGroup.Item`

完整组件目录与示例：`docs/ui.md`。

---

## 阶段意识（当前在哪 / 下一步做什么）

- **Phase 1（已完成）**：`legacy-web/` 通过 `git subtree` 合并 + PR #1。
- **Phase 2（进行中 / 下一会话从这里开始）**：MVP 功能端口。四个新 FSD 模块：
  - `features/dictionary/` 词库目录 + JSON 加载（MMKV 缓存）
  - `features/typing/` 听写状态机（D5：**听写主打 + 系统键盘**唯一输入模式，永远不做虚拟 QWERTY）
  - `features/audio/` 音频封装。**用 `expo-audio`，不要用 `expo-av`**（SDK 54+ 已 deprecated）
  - `features/progress/` `expo-sqlite` 错题本/章节统计
- **Phase 3（远期）**：云同步 + 账户，方案见 D8。

---

## 参考文档

| 文档 | 内容 |
|------|------|
| `AGENTS.md` | 通用 Agent 协作规则（必读） |
| `README.md` | 模板功能矩阵、环境变量、Android 签名/打包流程 |
| `docs/architecture.md` | FSD 详细规则、Provider 树、路由结构 |
| `docs/ui.md` | HeroUI Native 组件目录、主题系统 |
| `docs/patterns.md` | HeroUI 组合 / Query hook / Store / testID 复制粘贴模板 |
| `docs/tech-stack.md` | 完整依赖与版本号 |
| `docs/project-status.md` | Feature Flags 状态与模板自身待办 |
| Plan file | `/home/aiwork/.claude/plans/templates-cloudflare-verser-verser-clou-bubbly-kite.md`（D1-D8 决策档案） |
