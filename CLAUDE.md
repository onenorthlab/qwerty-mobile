# OneRN Starter 2 — Claude Code 扩展规范

> 通用项目规范见 **AGENTS.md**（所有 AI Agent 均适用）。
> Agent Skills 在 **`.agents/skills/`**（跨 Agent 通用格式）。
> 本文件仅包含 Claude Code 专属说明。

---

## Agent Skills

Skills 存放在 `.agents/skills/`，遵循 [agentskills.io](https://agentskills.io/specification) 规范，支持 Claude Code、VS Code Copilot、OpenAI Codex 等多个 Agent 自动发现。

| Skill | 触发场景 |
|-------|---------|
| `rn-architect` | 架构决策、Provider 组合、新功能设计 |
| `debug-detective` | Metro 报错、原生模块崩溃、TypeScript 错误 |
| `rn-reviewer` | 代码审查（FSD / 翻译 / testID / 颜色合规） |
| `learner` | bug 修复后固化知识到文档 |
| `tech-researcher` | 评估新 npm 包、SDK 升级 |
| `ux-mobile` | iOS HIG / Material / 无障碍审查 |
| `security-researcher` | RLS / SecureStore / Auth 安全审计 |
| `create-feature` | 创建完整 FSD 功能模块 |
| `create-screen` | 创建新页面（含 SafeView / testID / 翻译） |
| `add-translation` | 同步添加 en.ts + zh.ts key |

---

---

## UI 规则（重要 — 避免"界面很素"）

构建任何新页面或功能前，**优先使用 HeroUI Native 组件**（`heroui-native` 已在依赖中，`HeroUINativeProvider` 已接入）。常用：
`Card` / `Button` / `TextField` / `TextArea` / `ListGroup` / `Switch` / `Chip` / `Alert` / `Dialog` / `Toast` / `Separator` / `Tabs` / `Accordion` / `Avatar` / `Select` / `RadioGroup`。

只在 HeroUI 缺少对应组件时才回退到 `View` + Tailwind。完整组件目录与示例见 [docs/ui.md](docs/ui.md#heroui-native-组件目录)。

违反示例（必须避免）：
- 按钮用 `Pressable` + 自写 rounded/bg → 改用 `Button`
- 卡片用 `<View className="rounded-xl p-4 bg-surface">` → 改用 `Card` 或 `Surface`
- toggle 手写 → 改用 `Switch`
- 裸 `TextInput` → 改用 `TextField`
- 手写 chip 行 → 改用 `Chip` / `TagGroup`
- 列表项用一堆 `Pressable` → 改用 `ListGroup.Item`

## 参考文档

- `docs/ui.md` — **HeroUI Native 组件目录**、主题系统、light/dark 切换
- `docs/architecture.md` — FSD 目录、Provider 树、路由结构、Feature Flags 三层设计
- `docs/patterns.md` — 代码模式速查（HeroUI 组合 / Query hook / Store / testID / 颜色等）
- `docs/tech-stack.md` — 完整技术栈与版本号
- `docs/project-status.md` — Feature Flags 状态与待办
