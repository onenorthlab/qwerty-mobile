# UI 样式方案

> 本文档描述 `one-rn-starter2` 的主题系统设计、light/dark 切换机制，以及各层样式工具的正确用法。

---

## 技术栈概览

| 角色 | 技术 | 说明 |
|------|------|------|
| CSS 引擎 | Tailwind CSS v4 + Uniwind | 工具类样式，RN 原生渲染 |
| 组件主题 | HeroUI Native | CSS 变量驱动的 UI 组件库 |
| 主题切换 | `Uniwind.setTheme('light'\|'dark')` | 运行时切换，影响所有 `dark:` 类 |
| 颜色 Hook | `useThemeColor(name)` | 读取 HeroUI CSS 变量，返回解析后的字符串 |
| 自定义色 | `useAppColors(keys)` | 读取项目内置的装饰色（不在 HeroUI 类型中） |

---

## HeroUI Native 组件目录

> **规则：构建任何页面/功能时，优先使用下列 HeroUI 组件，而不是用 `View`+`Pressable`+`Tailwind` 自己拼。**
> 只有在 HeroUI 没有对应组件时才回退到 RN 原生。

所有组件通过 `import { X } from 'heroui-native'` 引入。已在 `RootProviders.tsx` 中接入 `HeroUINativeProvider`，无需额外配置。

### 容器 / 结构

| 组件 | 用途 | 何时使用 |
|------|------|---------|
| `Surface` | 带 elevation 的卡片容器 | 任何需要"成块背景"的地方 |
| `Card` + `Card.Header/Body/Footer/Title/Description` | 结构化卡片 | 设置项块、信息展示、功能说明块 |
| `ListGroup` | 列表行容器（自带分隔线） | 设置列表、账户列表、选项列表 |
| `Separator` | 分隔线 | 替代 `<View className="h-px bg-border" />` |
| `Accordion` | 折叠面板 | FAQ、可展开设置 |
| `Tabs` | 选项卡 | 分区切换（替代手写 chip row） |
| `ScrollShadow` | 带上下渐隐的滚动区 | 长内容区域 |

### 输入

| 组件 | 用途 |
|------|------|
| `TextField` | 单行文本输入（自带 label / error / placeholder） |
| `TextArea` | 多行输入 |
| `SearchField` | 搜索框（自带搜索图标、清除按钮） |
| `InputOTP` | 验证码输入 |
| `InputGroup` | 输入框组合（前后缀图标/按钮） |

### 选择 / 切换

| 组件 | 用途 |
|------|------|
| `Button` | 主按钮（variant: primary/secondary/ghost/destructive；size: sm/md/lg） |
| `LinkButton` | 链接样式按钮 |
| `Switch` | 开关（**替代** 手写的 toggle） |
| `Checkbox` | 复选 |
| `RadioGroup` + `Radio` | 单选组 |
| `Select` | 下拉选择 |
| `Slider` | 滑杆 |
| `Chip` | 芯片/标签（可点击/可关闭） |
| `TagGroup` | 多个 chip 的组合 |

### 反馈 / 状态

| 组件 | 用途 |
|------|------|
| `Alert` | 内联提示条（info/success/warning/danger） |
| `Toast` | 浮层提示（短暂出现） |
| `Dialog` | 对话框/确认弹窗 |
| `Popover` | 气泡弹层 |
| `Menu` + `SubMenu` | 弹出菜单 |
| `BottomSheet` | 底部抽屉（已在 Provider 中注册） |
| `Spinner` | 加载指示器 |
| `Skeleton` + `SkeletonGroup` | 骨架屏占位 |

### 其他

| 组件 | 用途 |
|------|------|
| `Avatar` | 头像（圆形，支持 fallback） |
| `Label` | 表单标签 |
| `Description` | 辅助说明文字 |
| `FieldError` | 表单错误文字 |
| `CloseButton` | 标准关闭按钮 |
| `PressableFeedback` | 带按压反馈的 Pressable |

### 典型组合示例

**设置项行（ListGroup + Switch）：**
```tsx
import { ListGroup, Switch } from 'heroui-native';

<ListGroup>
  <ListGroup.Item
    title={t('settings_notifications')}
    description={t('settings_notifications_desc')}
    endContent={<Switch value={enabled} onValueChange={setEnabled} />}
  />
  <ListGroup.Item
    title={t('settings_manage_devices')}
    onPress={() => router.push('/devices')}
    endContent={<ChevronRight size={16} color={muted} />}
  />
</ListGroup>
```

**信息卡（Card）：**
```tsx
import { Card, Button } from 'heroui-native';

<Card>
  <Card.Header>
    <Sparkles size={20} color={accent} />
  </Card.Header>
  <Card.Body>
    <Card.Title>{t('upgrade_title')}</Card.Title>
    <Card.Description>{t('upgrade_desc')}</Card.Description>
  </Card.Body>
  <Card.Footer>
    <Button testID="upgrade-cta" onPress={onUpgrade}>
      {t('upgrade_cta')}
    </Button>
  </Card.Footer>
</Card>
```

**表单（TextField + Button）：**
```tsx
import { TextField, Button } from 'heroui-native';

<TextField
  testID="login-email"
  label={t('login_email')}
  placeholder={t('login_email_placeholder')}
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>
<Button testID="login-submit" onPress={onSubmit} isLoading={isPending}>
  {t('login_submit')}
</Button>
```

### 何时不用 HeroUI

- 纯布局容器（只做 flex / padding）→ `<View className="...">`
- 纯文本（无标题语义）→ `<Text className="...">`
- 外部库强制的容器（如 `SafeAreaView`、`KeyboardAvoidingView`）

---

## Uniwind className 支持范围

Uniwind v1.6.2 在 `types.d.ts` 中扩充了 React Native 的所有核心组件类型，**绝大多数组件可以直接用 `className`**，无需 `style` prop：

```
View、Text、Pressable、TouchableWithoutFeedback  → className
TextInput        → className + placeholderTextColorClassName / cursorColorClassName
ActivityIndicator → colorClassName
Switch           → thumbColorClassName / trackColorOnClassName / trackColorOffClassName
Image            → className + tintColorClassName
ScrollView       → className + contentContainerClassName
FlatList         → contentContainerClassName + columnWrapperClassName
RefreshControl   → tintColorClassName / colorsClassName
```

> **规律：** 原生的非 style 类 color prop（`placeholderTextColor`、`tintColor` 等）对应 `xxxClassName`，需要 `accent-` 前缀的颜色类。

### TextInput 正确写法

```tsx
<TextInput
  className="flex-1 text-base text-field-foreground"
  placeholderTextColorClassName="accent-field-placeholder"
  placeholder="Email"
/>
```

旧写法（仍然有效，但冗余）：

```tsx
// ❌ 不推荐：绕过了 Uniwind 的 className 系统
const [fieldFg, fieldPlaceholder] = useThemeColor(['field-foreground', 'field-placeholder']);
<TextInput
  style={{ color: fieldFg }}
  placeholderTextColor={fieldPlaceholder}
/>
```

### ActivityIndicator 正确写法

```tsx
<ActivityIndicator size="small" colorClassName="accent-accent" />
```

---

## ⚠️ 唯一的 className 限制：SafeAreaView

**现象：** 将 `className` 加在 `SafeAreaView`（来自 `react-native-safe-area-context`）上，会导致所有子 `Text` 节点文字变为透明，即使显式设置了 `style={{ color: 'red' }}` 也无效。

**根因：** Tailwind CSS base 样式通过 Uniwind 注入了一个 `color` CSS 变量，该变量在 SafeAreaView 上触发时会沿 RN View 树向下级联到所有 Text 节点。这是 SafeAreaView 作为第三方组件（非原生 RN 内置）处理 className 时的特殊行为。

**正确方案：使用 `withUniwind` 包装，或通过 `style` prop 传入背景色**

方案 A — 封装为 `SafeView`（项目当前方案，推荐）：

```tsx
// src/shared/ui/SafeView.tsx
import { useThemeColor } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SafeView({ children, style, edges, ...props }) {
  const backgroundColor = useThemeColor('background');
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor }, style]}  // ← style prop，不用 className
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}
```

方案 B — 使用 `withUniwind`（允许 className，但仍不级联 color 到子节点）：

```tsx
import { withUniwind } from 'uniwind';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledSafeAreaView = withUniwind(SafeAreaView);

// className 控制 SafeAreaView 自身的 bg/flex/padding，不影响子节点颜色继承
<StyledSafeAreaView className="flex-1 bg-background" edges={['top']}>
  <Text className="text-foreground">正常显示</Text>
</StyledSafeAreaView>
```

**使用原则：**
- 所有页面统一通过 `<SafeView>` 作为根容器
- SafeView 内部的所有 View / Text 可以正常使用 className

---

## CSS 变量分层

### 第一层：`@theme`（Tailwind token）

在 `global.css` 中定义，作用于 Tailwind 工具类（`bg-primary-500` 等）：

```css
@theme {
  --color-primary-50:  #eff6ff;
  --color-primary-500: #3b82f6;
  /* ... primary 调色板 */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

### 第二层：`@layer theme`（HeroUI 语义变量）

覆盖 HeroUI Native 的 CSS 变量，驱动 `useThemeColor` 返回值和组件内部配色：

```css
@layer theme {
  :root {
    @variant light {
      --accent:             #2563eb;
      --accent-foreground:  #ffffff;
      --background:         #ffffff;
      --foreground:         #111827;
      --muted:              #6b7280;
      --default:            #f3f4f6;
      --default-foreground: #111827;
      --surface:            #ffffff;
      --surface-foreground: #111827;
      --border:             #e5e7eb;
      --success:            #16a34a;
      --success-foreground: #ffffff;
      --warning:            #d97706;
      --warning-foreground: #ffffff;
      --danger:             #ef4444;
      --danger-foreground:  #ffffff;
      --field-background:   #f9fafb;
      --field-foreground:   #111827;
      --field-placeholder:  #9ca3af;
    }
    @variant dark {
      --accent:             #3b82f6;
      --accent-foreground:  #ffffff;
      --background:         #111827;
      --foreground:         #f9fafb;
      --muted:              #9ca3af;
      --default:            #1f2937;
      --default-foreground: #f9fafb;
      --surface:            #1f2937;
      --surface-foreground: #f9fafb;
      --border:             #374151;
      --success:            #22c55e;
      --success-foreground: #111827;
      --warning:            #f59e0b;
      --warning-foreground: #111827;
      --danger:             #f87171;
      --danger-foreground:  #111827;
      --field-background:   #1f2937;
      --field-foreground:   #f9fafb;
      --field-placeholder:  #6b7280;
    }
  }
}
```

> **为什么用 hex 而非 oklch？**  
> Uniwind CSS 解析器对 oklch 颜色空间的支持不稳定，统一使用 hex 值可避免运行时解析失败。

---

## 主题切换机制

### ThemeProvider

`src/providers/ThemeProvider.tsx` 负责将 Zustand 的主题偏好同步给 Uniwind：

```tsx
// 关键：必须先把 'system' 解析为 'light' | 'dark'，再传给 Uniwind
const resolvedTheme = themePreference === 'system'
  ? systemScheme === 'dark' ? 'dark' : 'light'
  : themePreference;

useEffect(() => {
  Uniwind.setTheme(resolvedTheme); // 只接受 'light' | 'dark'
}, [resolvedTheme]);
```

> **常见 Bug：** 直接传 `themePreference`（值可能为 `'system'`）给 `Uniwind.setTheme()` 会静默失败，导致主题不切换。

### StatusBar 样式

`src/app/_layout.tsx` 通过 `useUniwind()` 读取当前主题，自动调整状态栏前景色：

```tsx
const { theme: resolvedTheme } = useUniwind();
<StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
```

---

## 颜色 Hook 用法

### 何时用 `useThemeColor`，何时用 `className`

| 场景 | 推荐方式 |
|------|---------|
| Text / View 的背景、文字颜色 | `className="text-foreground bg-background"` |
| TextInput 文字颜色 | `className="text-field-foreground"` |
| TextInput placeholder 颜色 | `placeholderTextColorClassName="accent-field-placeholder"` |
| ActivityIndicator 颜色 | `colorClassName="accent-accent"` |
| 第三方图标库（Lucide 等）的 `color` prop | `useThemeColor('accent')` |
| 动态颜色（根据状态变化，如 loading） | `useThemeColor(...)` + 条件判断 |
| SafeAreaView 背景色 | `useThemeColor('background')` + `style` prop |

### `useThemeColor` — 读取 HeroUI 语义色

```tsx
import { useThemeColor } from 'heroui-native';

// 单色
const accent = useThemeColor('accent');

// 多色（用 as const 保留元组类型）
const [accent, fieldPlaceholder] = useThemeColor(
  ['accent', 'field-placeholder'] as const
);
```

**可用名称（`ThemeColor` 类型联合）：**

| 名称 | 用途 |
|------|------|
| `accent` | 主品牌色（按钮、高亮、图标） |
| `accent-foreground` | 主色背景上的文字 |
| `background` | 页面/容器背景 |
| `foreground` | 页面主文字 |
| `muted` | 次要文字、禁用态 |
| `default` | 卡片/芯片默认背景 |
| `default-foreground` | 卡片文字 |
| `surface` | 浮层/卡片背景 |
| `surface-foreground` | 浮层文字 |
| `border` | 分割线、边框 |
| `success` | 成功状态 |
| `success-foreground` | 成功色背景上的文字 |
| `warning` | 警告状态 |
| `warning-foreground` | 警告色背景上的文字 |
| `danger` | 危险/错误状态 |
| `danger-foreground` | 危险色背景上的文字 |
| `field-background` | 输入框背景（`useThemeColor` 用此名；**Tailwind 类用 `bg-field`，不是 `bg-field-background`**） |
| `field-foreground` | 输入框文字（Tailwind 类：`text-field-foreground`） |
| `field-placeholder` | 输入框占位文字（`placeholderTextColorClassName="accent-field-placeholder"`） |

### `useAppColors` — 读取项目装饰色

HeroUI 类型联合中不包含 purple / cyan / pink / amber，通过 `src/shared/lib/useAppColors.ts` 补充：

```tsx
import { useAppColors } from '@/shared/lib/useAppColors';

const [purple, cyan, pink, amber] = useAppColors(
  ['purple', 'cyan', 'pink', 'amber'] as const
);
```

| 名称 | light | dark |
|------|-------|------|
| `purple` | `#7c3aed` | `#a78bfa` |
| `cyan`   | `#0891b2` | `#22d3ee` |
| `pink`   | `#db2777` | `#f472b6` |
| `amber`  | `#b45309` | `#fbbf24` |

---

## SafeView 组件

`src/shared/ui/SafeView.tsx` 封装了上述约束，所有页面统一使用它作为根容器：

```tsx
import { SafeView } from '@/shared/ui/SafeView';

export default function MyScreen() {
  return (
    <SafeView edges={['top', 'left', 'right']}>
      {/* SafeView 内部可以自由使用 className */}
      <View className="flex-1 px-6 bg-white dark:bg-gray-900">
        <Text className="text-2xl font-bold text-foreground">Hello</Text>
        <TextInput
          className="text-base text-field-foreground bg-field rounded-xl px-4 py-3"
          placeholderTextColorClassName="accent-field-placeholder"
          placeholder="Enter text"
        />
      </View>
    </SafeView>
  );
}
```

---

## Tailwind `dark:` 工具类

内层 `View` / `Text` 可直接使用 Tailwind 的 `dark:` 变体，Uniwind 会在 `Uniwind.setTheme('dark')` 后自动切换：

```tsx
<Text className="text-gray-900 dark:text-gray-100">标题</Text>
<View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4" />
```

> `dark:` 由 `ThemeProvider` 通过 `Uniwind.setTheme()` 驱动，当用户选择「跟随系统」时与设备主题同步。

---

## 文件结构

```
src/
├── shared/
│   ├── lib/
│   │   └── useAppColors.ts      # 装饰色 hook（purple/cyan/pink/amber）
│   └── ui/
│       └── SafeView.tsx         # 安全根容器（主题背景色 + SafeAreaView）
├── providers/
│   └── ThemeProvider.tsx        # Zustand → Uniwind.setTheme 同步
└── app/
    ├── _layout.tsx              # StatusBar 样式（useUniwind）
    ├── (tabs)/
    │   ├── _layout.tsx          # Tab bar 颜色（useThemeColor）
    │   ├── index.tsx            # 首页图标色（useThemeColor + useAppColors）
    │   ├── explore.tsx          # 探索页图标色
    │   └── settings.tsx         # 设置页图标色 + 芯片
    └── (auth)/
        └── login.tsx            # 登录页（className + placeholderTextColorClassName）
global.css                       # @theme token + @layer theme CSS 变量
```
