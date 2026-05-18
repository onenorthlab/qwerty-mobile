---
name: create-screen
description: Create a new screen in src/app/ for one-rn-starter2 following project conventions — SafeView wrapper, HeroUI Native components, testID attributes, translation keys, dark mode colors, and route registration. Use when adding a new page to the app.
allowed-tools: Read Write Edit Glob Grep
metadata:
  project: one-rn-starter2
---

Create a new screen for: **$ARGUMENTS**

> **重要：本项目默认使用 HeroUI Native 组件构建 UI**（`heroui-native` 已在依赖中）。新建页面时，先查 [docs/ui.md 组件目录](../../docs/ui.md#heroui-native-组件目录) 挑选合适的 HeroUI 组件 — **不要**直接用 `Pressable` / `View` 拼卡片、按钮、开关、输入框、列表项。

## 1. Determine route location

| Screen type | Path |
|-------------|------|
| Tab screen | `src/app/(tabs)/<name>.tsx` |
| Auth screen | `src/app/(auth)/<name>.tsx` |
| Full-screen modal | `src/app/<name>.tsx` |

Read the nearest existing screen as reference before writing.

## 2. Screen template（HeroUI 优先）

```tsx
import { ScrollView } from 'react-native';
import { Card, Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../shared/ui/SafeView';

export default function <Name>Screen() {
  const { t } = useTranslation();

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        testID="<screen>-screen"
        contentContainerClassName="px-5 py-6 gap-4"
      >
        <Card>
          <Card.Body>
            <Card.Title>{t('<screen>_title')}</Card.Title>
            <Card.Description>{t('<screen>_desc')}</Card.Description>
          </Card.Body>
          <Card.Footer>
            <Button testID="<screen>-cta" onPress={onAction}>
              {t('<screen>_cta')}
            </Button>
          </Card.Footer>
        </Card>
      </ScrollView>
    </SafeView>
  );
}
```

## 3. 挑选合适的 HeroUI 组件

在写任何交互前，先核对清单（按场景查）：

- 卡片/信息块 → `Card` (带 `Header/Body/Footer/Title/Description`) 或 `Surface`
- 按钮 → `Button`（`variant`: primary/secondary/ghost/destructive）
- 列表行 → `ListGroup` + `ListGroup.Item`（带 `title` / `description` / `startContent` / `endContent`）
- 开关 → `Switch`（不要手写 toggle）
- 芯片/多选 → `Chip`、`TagGroup`
- 输入 → `TextField`、`TextArea`、`SearchField`、`InputOTP`
- 选择 → `Select`、`RadioGroup`、`Checkbox`、`Slider`
- 提示 → `Alert`（内联）、`Toast`（浮层）、`Dialog`（弹窗）
- 分隔 → `Separator`
- 折叠 → `Accordion`
- 分页切换 → `Tabs`
- 头像 → `Avatar`
- 加载 → `Spinner`、`Skeleton`

完整目录见 [docs/ui.md](../../docs/ui.md#heroui-native-组件目录)。

## 4. Required conventions

**testID**
- Root scroll/list: `testID="<screen>-screen"`
- Every interactive HeroUI 组件（`Button` / `Switch` / `TextField` / `Chip` / 可点击 `ListGroup.Item` / `Card.Footer` 里的按钮等）: `testID="<screen>-<element>"`

**Colors — no hardcoded values**
- 图标/非 HeroUI 组件的 color prop → `useThemeColor(['accent', 'muted', 'success', 'warning', 'danger'])`
- 装饰色 → `useAppColors(['purple', 'cyan', 'pink', 'amber'])`
- 根容器背景 → `style={{ backgroundColor }}`（SafeView 已处理）
- HeroUI 组件自带 light/dark 切换，无需为其传 color prop

**i18n — no hardcoded strings**
- 所有可见文字通过 `t('key')`
- 新 key 同时加到 `src/shared/lib/translations/en.ts` 和 `zh.ts`

## 5. Register the route

- Tab screen → add tab entry to `src/app/(tabs)/_layout.tsx`
- Add navigation link from an existing screen if appropriate

## 6. Done

List each created/modified file. Run `npx tsc --noEmit` to verify types.

**自检清单（提交前）：**
- [ ] 每个"看起来像按钮"的东西都是 `Button`，不是 `Pressable`
- [ ] 每个"看起来像卡片"的块都是 `Card` 或 `Surface`，不是 `View + rounded-xl`
- [ ] 每个 toggle 都是 `Switch`，不是手写
- [ ] 每个输入框都是 `TextField` / `TextArea`，不是裸 `TextInput`
- [ ] 列表项使用 `ListGroup`，不是一堆 `Pressable`
