---
name: add-translation
description: Add new i18n translation keys to one-rn-starter2, ensuring both en.ts and zh.ts are updated simultaneously and remain in sync. Use whenever adding user-visible text to any screen or component.
allowed-tools: Read Edit Glob Grep
metadata:
  project: one-rn-starter2
---

Add translation keys for: **$ARGUMENTS**

## Files to edit

- `src/shared/lib/translations/en.ts`
- `src/shared/lib/translations/zh.ts`

**Read both files first** to understand the existing structure and confirm the key doesn't already exist.

## Key naming convention

Format: `{screen}_{section}_{element}`

Examples: `settings_theme_light` · `paywall_annual_badge` · `devices_empty_state`

## Steps

1. **Add to `en.ts` first** — insert in alphabetical order within the relevant group. English values: clear, concise, consistent with existing style.

2. **Add the exact same keys to `zh.ts`** — same key names, natural Chinese values. Proper nouns and technical terms (brand names, SDK names) can remain in English.

3. **Verify alignment** — after both edits, confirm:
   - Same number of keys in both files
   - Same key names (spelling, underscores)
   - No key in one file but missing from the other

## Output

List each key added with its English and Chinese values. Flag any translations that were uncertain.
