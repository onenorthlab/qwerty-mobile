# OneRN Starter 2 — AI Agent 协作规范

本文件适用于所有 AI 编码 Agent（Claude Code、Codex、Gemini CLI、Cursor 等）。

---

## 项目概述

生产级 React Native + Expo 起步模板。架构模式：**Feature-Sliced Design (FSD)**。
技术栈：React Native 0.83.4 / Expo SDK 55 / TypeScript strict / Zustand v5 / TanStack Query v5 / Supabase / OneSignal v5 / RevenueCat SDK v9。

---

## 目录边界

```
src/
├── app/          # 只放页面和布局，不放业务逻辑
├── features/     # 按业务域划分，每个模块有独立 index.ts 公开 API
│   └── <name>/
│       ├── model/   # Zustand store
│       ├── lib/     # TanStack Query hooks、工具函数
│       ├── ui/      # 该功能专属 UI 组件
│       └── index.ts # 唯一对外接口
├── providers/    # React Context + SDK 初始化
└── shared/       # 通用工具、UI 基础组件、配置（不含业务逻辑）
```

跨 feature 调用必须通过 `features/<name>/index.ts`，不允许直接 import 内部路径。

---

## 核心规则

### 1. 国际化（i18n）
- 所有用户可见文字必须用 `t('key')`，不允许硬编码字符串
- 新增 key 必须**同时**更新 `src/shared/lib/translations/en.ts` 和 `zh.ts`
- 两文件 key 集合必须完全一致（数量、名称均相同）
- 命名约定：`{screen}_{section}_{element}`，例如 `settings_theme_light`

### 2. testID
- 所有 Pressable、Button、TextInput、ScrollView 须有 `testID`
- 格式：`{screen}-{element}`，例如 `settings-theme-dark`
- 小写连字符，不使用动态值

### 3. 颜色
- **禁止硬编码颜色值**（包括 className 内的静态色）
- 语义色：`useThemeColor(['accent', 'muted', 'success', 'warning', 'danger'])`
- 装饰色：`useAppColors(['purple', 'cyan', 'pink', 'amber'])`
- 根容器背景色必须用 `style={{ backgroundColor }}` 而非 `className`（否则子 Text 颜色丢失）

### 4. UI 组件（重要）
- **优先使用 HeroUI Native 组件**，不要用"裸 View + Tailwind"拼界面
- 常用清单（按使用频率排序）：
  - 按钮：`Button`（不要用 `Pressable` + 手动样式）
  - 容器：`Surface`、`Card`（含 `Card.Header/Body/Footer/Title/Description`）
  - 列表：`ListGroup`（行项与分隔线自动处理）
  - 输入：`TextField`、`TextArea`、`SearchField`、`InputOTP`
  - 选择：`Switch`、`Checkbox`、`RadioGroup`、`Select`、`Slider`、`Chip`、`TagGroup`
  - 反馈：`Alert`、`Toast`、`Dialog`、`Spinner`、`Skeleton`
  - 结构：`Tabs`、`Accordion`、`Separator`、`Avatar`、`Popover`、`Menu`、`BottomSheet`
- 仅在 HeroUI 缺少对应组件时才回退到 `View` / `Pressable`
- 完整组件目录与复制粘贴示例见 [docs/ui.md](docs/ui.md#heroui-native-组件目录) 和 [docs/patterns.md](docs/patterns.md#heroui-native-组件)

### 5. Feature Flags
- 可选功能注册到 `src/shared/config/features.ts` 的 `FEATURES` 对象
- UI 门控：`{FEATURES.FOO && <Section />}`
- Hooks 仍须无条件调用（Context 提供 no-op 默认值）
- 依赖链：NOTIFICATIONS 和 IAP 均依赖 AUTH（user ID 同步）

### 6. 安全
- 敏感数据（token、密钥）存 `expo-secure-store`，不存 MMKV
- 所有 Supabase 表须配置 RLS 策略
- 环境变量通过 `src/shared/config/env.ts` 用 Zod 校验后使用

### 6. 通用编码约定
- 修改文件前必须先读取，不允许盲改
- TypeScript 严格模式，不允许 `any`
- 不创建不必要的文件，优先编辑现有文件
- React Hooks 不在条件中调用

---

## 常用命令

```bash
npm install --legacy-peer-deps   # 安装依赖
npx expo run:ios                 # iOS dev build
npx expo run:android             # Android dev build
npx expo prebuild --platform ios # 修改 app.config.ts 后重建
npx tsc --noEmit                 # 类型检查
npm run e2e                      # Maestro E2E 测试
```

---

## Agent Skills

可复用的专项 Skills 存放在 `.agents/skills/`，遵循 [agentskills.io](https://agentskills.io/specification) 规范，支持 Claude Code、VS Code Copilot、OpenAI Codex 等 Agent 自动发现。

| Skill | 用途 |
|-------|------|
| `rn-architect` | 架构决策与新功能设计 |
| `debug-detective` | 报错调试与已知坑点速查 |
| `rn-reviewer` | 代码审查 checklist |
| `learner` | bug 修复后更新文档 |
| `tech-researcher` | 新包评估与 SDK 升级 |
| `ux-mobile` | iOS / Android UX 审查 |
| `security-researcher` | 安全审计 |
| `create-feature` | 创建 FSD 功能模块 |
| `create-screen` | 创建新页面 |
| `add-translation` | 同步添加翻译 key |

## 参考文档

- `CLAUDE.md` — Claude Code 专属扩展规则
- `docs/architecture.md` — FSD 目录、Provider 树、路由结构
- `docs/patterns.md` — 代码模式速查
- `docs/tech-stack.md` — 完整技术栈与版本
- `docs/project-status.md` — Feature Flags 状态与待办
