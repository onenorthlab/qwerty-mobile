---
name: create-feature
description: Create a new Feature-Sliced Design module in src/features/<name>/ with the standard directory structure, Zustand store, TanStack Query hooks, and translation keys. Use when adding a new business domain to one-rn-starter2.
allowed-tools: Read Write Edit Glob Grep Bash
metadata:
  project: one-rn-starter2
---

Create a new FSD feature module for: **$ARGUMENTS**

See [docs/patterns.md](../../docs/patterns.md) for canonical code patterns to follow.

> **UI 构建规则：** 本项目默认使用 **HeroUI Native** 组件。`features/<name>/ui/` 下所有组件 **必须**优先用 HeroUI（`Card` / `Button` / `TextField` / `ListGroup` / `Switch` / `Chip` / `Alert` 等）而不是"裸 View + Pressable + Tailwind"。完整组件目录见 [docs/ui.md](../../docs/ui.md#heroui-native-组件目录)。

## Steps

### 1. Plan the module
- Feature name: lowercase, hyphenated
- Does it need a Zustand store (persistent state) or only TanStack Query (server state)?
- What Supabase tables or external APIs does it interact with?

### 2. Create the directory structure

```
src/features/<name>/
├── model/
│   └── <name>-store.ts      # Zustand store (only if persistent state needed)
├── lib/
│   ├── use<Entity>.ts        # TanStack Query read hook
│   └── use<Action>.ts        # Mutation hook (if needed)
├── ui/
│   └── <Component>.tsx       # Feature-specific components
└── index.ts                  # Public API — export only what other modules need
```

Only create subdirectories that are actually needed.

### 3. Zustand store pattern

Reference: `src/features/settings/model/settings-store.ts`
- Use `persist` middleware with `zustandStorage`
- Export the hook and the state type

### 4. TanStack Query hooks pattern

Reference: `src/features/notifications/lib/useDevices.ts`
- Query keys: `['<feature>', '<entity>']`
- Mutations: `invalidateQueries` on success
- Import `queryClient` from `src/shared/lib/queryClient.ts`

### 5. Add translation keys

Add to BOTH files (identical key names, different values):
- `src/shared/lib/translations/en.ts` — English
- `src/shared/lib/translations/zh.ts` — Chinese
- Naming: `<feature>_<element>` (e.g., `devices_empty_state`)

### 6. Create index.ts

Export only the public API. Keep internals unexported.

### 7. Register Feature Flag (if optional)

If the feature can be disabled:
- Add to `src/shared/config/features.ts`
- Add env var comment to `.env.example`
- Note AUTH dependency if applicable

## Done

List each created file. Run `npx tsc --noEmit` to verify types.
