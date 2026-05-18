# Code Patterns — one-rn-starter2

Quick reference for the patterns used throughout the codebase.

---

## HeroUI Native 组件（优先使用）

**项目默认使用 HeroUI Native 构建 UI。** 在写任何新页面/功能前，先看 [docs/ui.md 组件目录](ui.md#heroui-native-组件目录)，找到对应组件；仅当 HeroUI 缺少才回退到 `View` / `Pressable`。

### 页面骨架（推荐）

```tsx
import { ScrollView } from 'react-native';
import { Card, Button, ListGroup, Switch, Chip } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../shared/ui/SafeView';

export default function MyScreen() {
  const { t } = useTranslation();
  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        testID="my-screen"
        contentContainerClassName="px-5 py-6 gap-4"
      >
        <Card>
          <Card.Body>
            <Card.Title>{t('my_title')}</Card.Title>
            <Card.Description>{t('my_desc')}</Card.Description>
          </Card.Body>
          <Card.Footer>
            <Button testID="my-action" onPress={onAction}>
              {t('my_action')}
            </Button>
          </Card.Footer>
        </Card>
      </ScrollView>
    </SafeView>
  );
}
```

### 常见映射：不要这么写 → 改这么写

| ❌ 不要 | ✅ 改用 |
|--------|--------|
| `<Pressable className="bg-accent px-4 py-2 rounded-xl">...</Pressable>` | `<Button onPress={...}>...</Button>` |
| `<View className="p-4 rounded-xl bg-surface">...</View>` | `<Surface>...</Surface>` 或 `<Card><Card.Body>...</Card.Body></Card>` |
| 手写 toggle row（Pressable + 文本 + 小圆点） | `<ListGroup.Item title=... endContent={<Switch .../>} />` |
| 手写 chip（Pressable + `active ? bg-accent` 条件） | `<Chip selected={...} onPress={...}>...</Chip>` |
| `<TextInput className="..." />` | `<TextField label=... placeholder=... />` |
| 手写 alert banner | `<Alert variant="warning">...</Alert>` |
| `<View className="h-px bg-border" />` | `<Separator />` |

---

## TanStack Query Hook

### Read (useQuery)

```typescript
// src/features/<name>/lib/use<Entity>.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../shared/api/supabase';

export function use<Entity>() {
  return useQuery({
    queryKey: ['<feature>', '<entity>'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('<table>')
        .select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}
```

### Mutation (useMutation)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function use<Action>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InputType) => {
      const { error } = await supabase.from('<table>').insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['<feature>'] });
    },
  });
}
```

**Special case — entitlement query:** Uses `gcTime: 0` to prevent cross-user cache pollution after sign-out.

---

## Zustand Store

```typescript
// src/features/<name>/model/<name>-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../../../shared/lib/storage';

interface <Name>State {
  value: string;
  setValue: (v: string) => void;
  reset: () => void;
}

const DEFAULTS = { value: 'default' };

export const use<Name>Store = create<<Name>State>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setValue: (value) => set({ value }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: '<name>-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
```

---

## Translation Key

```typescript
// Always add to BOTH en.ts and zh.ts with the same key name

// src/shared/lib/translations/en.ts
export default {
  // ... existing keys ...
  feature_name: 'Feature Name',
  feature_name_desc: 'Short description of what this does',
} as const;

// src/shared/lib/translations/zh.ts
export default {
  // ... existing keys ...
  feature_name: '功能名称',
  feature_name_desc: '功能的简短说明',
} as const;

// Usage in component
const { t } = useTranslation();
<Text>{t('feature_name')}</Text>
```

---

## testID

```tsx
// Format: {screen}-{element}
// All lowercase, hyphenated

<ScrollView testID="settings-screen" ...>
<Pressable testID="settings-theme-light" onPress={...}>
<Button testID="settings-reset" onPress={...}>
<TextInput testID="login-email-input" ...>
```

---

## Colors

```tsx
import { useThemeColor } from 'heroui-native';
import { useAppColors } from '../../shared/lib/useAppColors';

// Semantic colors (from HeroUI CSS vars)
const [accent, muted, success, warning, danger] = useThemeColor(
  ['accent', 'muted', 'success', 'warning', 'danger'] as const
);

// Decorative colors (not in HeroUI type union)
const [purple, cyan, pink, amber] = useAppColors(
  ['purple', 'cyan', 'pink', 'amber'] as const
);

// Use in JSX
<Icon color={accent} />
<View style={{ backgroundColor: success }} />

// Root container background — MUST use style, not className
const background = useThemeColor(['background'] as const)[0];
<View style={{ flex: 1, backgroundColor: background }}>
```

---

## Feature Flag Gate

```tsx
import { FEATURES } from '../../shared/config/features';

// UI gate — wrap entire optional section
{FEATURES.NOTIFICATIONS && (
  <View>
    {/* notification settings section */}
  </View>
)}

// Hooks are still called unconditionally (never in a condition)
// They return safe defaults when Provider is absent
const { hasPermission } = useNotifications();  // always called
const { isPro } = useEntitlement();            // always called
```

---

## SafeView

```tsx
import { SafeView } from '../../shared/ui/SafeView';

// Standard screen wrapper
<SafeView edges={['top', 'left', 'right']}>
  <ScrollView
    testID="<screen>-screen"
    className="flex-1 bg-white dark:bg-gray-900"
    contentContainerClassName="px-6 py-12"
  >
    {/* content */}
  </ScrollView>
</SafeView>
```

---

## Supabase Query with Type

```typescript
// Always pass explicit type to prevent `any` leakage
const { data, error } = await supabase
  .from<NotificationDevice>('notification_devices')
  .select('*')
  .eq('user_id', userId);
```

---

## Provider with no-op Default Context

Used to allow hooks like `useNotifications()` to be called unconditionally even when the Provider is absent (FEATURES.X=false):

```typescript
const DEFAULT_CTX: ContextType = {
  value: false,
  doSomething: async () => {},
};
const MyContext = createContext<ContextType>(DEFAULT_CTX);

export function useMyThing() {
  return useContext(MyContext);  // No null check needed
}
```

---

## Conditional Provider (MaybeX pattern)

```tsx
// In RootProviders.tsx
function MaybeNotifications({ children }: { children: React.ReactNode }) {
  return FEATURES.NOTIFICATIONS
    ? <NotificationProvider>{children}</NotificationProvider>
    : <>{children}</>;
}
```
