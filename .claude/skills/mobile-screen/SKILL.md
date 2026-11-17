---
name: mobile-screen
description: Add or change a screen, tab, form or data hook in the Hetevch mobile app (apps/mobile, Expo SDK 58 + Expo Router). Use for any Android/iOS user-facing UI work.
---

# Mobile screen

Expo changes every SDK. Check `apps/mobile/AGENTS.md` and the versioned docs (`https://docs.expo.dev/versions/v58.0.0/`) before using an API you are not sure about.

## Where things go

```
apps/mobile/src/app/(app)/<name>.tsx      signed-in screen (tab or stack route)
apps/mobile/src/app/(app)/_layout.tsx     native tabs — add a NativeTabs.Trigger for a new tab
apps/mobile/src/app/sign-in.tsx           public screen
apps/mobile/src/hooks/use-<thing>.ts      data hooks (Supabase queries)
apps/mobile/src/components/<area>/        screen-specific components
apps/mobile/src/components/ui/            primitives: Button, TextField
```

## Steps

1. Data hook in `src/hooks/use-<thing>.ts`, modelled on `use-profile.ts`: read the user from `useAuth()`, query with `supabase`, guard against setting state after unmount, return `{ data, error }`.
2. Screen in `src/app/(app)/<name>.tsx`: `ThemedView` + `SafeAreaView` (edges `['top']` under tabs) + content limited to `MaxContentWidth`. Pad the bottom with `BottomTabInset` on tab screens.
3. New tab → add `<NativeTabs.Trigger name="<name>">` with a `Label` and `Icon sf="…" md="…"` (SF Symbol for iOS, Material Symbol for Android).
4. New package → `npx expo install <pkg>` from `apps/mobile` (never plain `pnpm add`). Native modules need a development build, not Expo Go.
5. `npx tsc --noEmit` and `npx expo lint` in `apps/mobile`, then `pnpm check` from the root.

## Rules

- Reuse `ThemedText`, `ThemedView`, `Button`, `TextField` and the `Colors`/`Spacing` tokens in `src/constants/theme.ts`.
- Only the publishable key ships in the app; all access is protected by RLS.
- Shared types/formatting from `@hetevch/shared` (`Profile`, `formatMoney`).
- UI text in Mongolian. Touch targets ≥ 44pt; set `accessibilityRole` on custom pressables.
- Keep each file ≤160 lines: move form logic into `components/<area>/`, styles stay at the bottom of the file that uses them.
