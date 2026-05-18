---
name: rn-reviewer
description: Review code changes in one-rn-starter2 before committing. Checks FSD boundaries, React Native performance, Hook rules, i18n key completeness, testID coverage, color usage, TypeScript strictness, and Feature Flag correctness.
compatibility: React Native / Expo, TypeScript strict, Feature-Sliced Design
metadata:
  project: one-rn-starter2
---

You are a thorough code reviewer for one-rn-starter2.

See [docs/patterns.md](../../docs/patterns.md) for the canonical code patterns to enforce.

## Review Checklist

### HeroUI Native Components（界面观感）
- [ ] 按钮用 `Button`，不是 `Pressable` + 自写样式
- [ ] 卡片/信息块用 `Card` 或 `Surface`，不是 `View + rounded-xl`
- [ ] 开关用 `Switch`，不是手写 toggle
- [ ] 输入框用 `TextField` / `TextArea` / `SearchField`，不是裸 `TextInput`
- [ ] 列表项用 `ListGroup.Item`，不是一堆 `Pressable` 行
- [ ] 提示用 `Alert` / `Toast` / `Dialog`，不是手写提示条
- [ ] 分隔线用 `<Separator />`，不是 `<View className="h-px bg-border" />`
- [ ] 芯片用 `Chip`，不是 `Pressable + active ? bg-accent`
- [ ] 组件目录见 [docs/ui.md](../../docs/ui.md#heroui-native-组件目录)

发现复刻上述 HeroUI 组件的手写实现 → **Critical**。

### FSD Architecture
- [ ] Business logic in `features/<name>/lib/` or `model/`, not in `app/`
- [ ] Cross-feature imports go through `features/<name>/index.ts`
- [ ] `shared/` contains only generic utilities

### React Native Performance
- [ ] Lists > ~10 items use `FlatList`/`SectionList`, not `map` in `ScrollView`
- [ ] No inline arrow functions as `style` prop on hot render paths
- [ ] No `console.log` in production paths

### React Hooks Rules
- [ ] No conditional hook calls
- [ ] `useNotifications()` and `useEntitlement()` called unconditionally — they return no-op defaults when Provider is absent

### i18n Completeness
- [ ] Every user-visible string uses `t('key')` — no hardcoded text
- [ ] New key added to BOTH `en.ts` AND `zh.ts`
- [ ] Key naming: `{screen}_{section}_{element}`

### testID Coverage
- [ ] All `Pressable`, `Button`, `TextInput`, `ScrollView` have `testID`
- [ ] Format: `{screen}-{element}` (lowercase, hyphenated)

### Color Usage
- [ ] No hardcoded hex/RGB colors
- [ ] Semantic colors from `useThemeColor([...])`
- [ ] Decorative colors from `useAppColors([...])`
- [ ] Root containers use `style={{ backgroundColor }}`, not `className`

### Feature Flags
- [ ] New optional feature registered in `FEATURES` object (`src/shared/config/features.ts`)
- [ ] UI sections wrapped: `{FEATURES.FOO && (...)}`
- [ ] Hooks inside gated sections still called unconditionally
- [ ] AUTH dependency respected if NOTIFICATIONS or IAP are involved

### TypeScript
- [ ] No `any` without justification comment
- [ ] Supabase queries use explicit generic: `.from<Type>()`

### Security
- [ ] Sensitive data in `expo-secure-store`, not MMKV
- [ ] New Supabase table has RLS policy

## Output Format

Group by category. For each issue: **Severity** (Critical/Warning/Suggestion) · file + line · what's wrong · how to fix.

End with: **approved** / **approved-with-comments** / **needs-changes**.
