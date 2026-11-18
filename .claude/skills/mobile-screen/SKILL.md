---
name: mobile-screen
description: Add or change a screen, tab, form or data hook in the Hetevch mobile app (apps/mobile, Expo SDK 58 + Expo Router). Use for any Android/iOS user-facing UI work.
---

# Mobile screen

Expo changes every SDK. Check `apps/mobile/AGENTS.md` and the versioned docs (`https://docs.expo.dev/versions/v58.0.0/`) before using an API you are not sure about.

## Where things go

```
apps/mobile/src/app/(app)/<name>.tsx      tab screen (3 tabs: index, transactions, profile)
apps/mobile/src/app/(app)/_layout.tsx     native tabs — add a NativeTabs.Trigger for a new tab
apps/mobile/src/app/<area>/<name>.tsx     screen pushed over the tabs (settings/*, savings/*, legal/*)
apps/mobile/src/app/_layout.tsx           root Stack: register pushed screens with pushed('<title>'),
                                          sheets with presentation 'modal'; inside the session guard
                                          unless the screen must work signed out
apps/mobile/src/app/sign-in.tsx           public screen
apps/mobile/src/hooks/use-<thing>.ts      data hooks (Supabase queries)
apps/mobile/src/components/<area>/        screen-specific components
apps/mobile/src/components/ui/            primitives (below)
```

Primitives to reuse before writing new ones: `Screen` (tab screens: title, pull-to-refresh), `Page` (pushed screens), `Card`, `Button`, `IconButton` (glyph or `icon`), `Icon` (SF Symbols / Material Symbols via `ICONS`), `TextField`, `Segmented`, `ChoiceChips`, `StateMessage`, `SettingsGroup` + `SettingsRow` (grouped lists), `DateField` (past dates), and `useMoney()` for every amount (see `money-and-dates`).

## Steps

1. Data hook in `src/hooks/use-<thing>.ts` on `useSupabaseQuery(key, run)` (see `use-savings.ts`): key from the user id, filter `.eq('user_id', userId)` (RLS lets admins read everyone), so `invalidate()` after a save reloads it.
2. Screen: tab screens use `Screen`; pushed screens use `Page` and get their title from the root layout. Sheets (add/edit) follow `app/transaction.tsx`: header with a close button, scrolling form, sticky footer button.
3. New tab → add `<NativeTabs.Trigger name="<name>">` with a `Label` and `Icon sf="…" md="…"` (SF Symbol for iOS, Material Symbol for Android).
4. New package → `npx expo install <pkg>` from `apps/mobile` (never plain `pnpm add`). Native modules need a development build, not Expo Go.
5. `npx tsc --noEmit` and `npx expo lint` in `apps/mobile`, then `pnpm check` from the root, then the `verify-mobile` skill.

## Rules

- Reuse `ThemedText`, `ThemedView`, `Button`, `TextField` and the `Colors`/`Spacing` tokens in `src/constants/theme.ts`.
- Only the publishable key ships in the app; all access is protected by RLS.
- Shared types and helpers from `@hetevch/shared`; money on screen goes through `useMoney()`, not `formatMoney`.
- Destructive actions (delete, sign out) confirm with `Alert.alert` first. A failed action shows an error, never an empty state.
- Avoid `index.tsx` in a folder without its own `_layout` (typed routes name it `/folder/index`).
- UI text in Mongolian. Touch targets ≥ 44pt; set `accessibilityRole` on custom pressables.
- Keep each file ≤160 lines: move form logic into `components/<area>/`, styles stay at the bottom of the file that uses them.
