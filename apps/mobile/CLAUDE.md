# apps/mobile — user app (Expo, Android + iOS)

@AGENTS.md

- Routes live in `src/app/`. `(app)/` is the signed-in area (native tabs); `sign-in.tsx` is public. The guard is `Stack.Protected` in `src/app/_layout.tsx`.
- Session state comes from `useAuth()` (`src/providers/auth-provider.tsx`). Supabase client: `src/lib/supabase.ts`. All data access goes through RLS as the signed-in user; never ship a secret key in the app.
- Shared types and helpers (e.g. `Profile`, `formatMoney`) come from `@hetevch/shared`.
- Reuse `ThemedText`, `ThemedView`, `Button`, `TextField` before writing new UI primitives. UI text is Mongolian (Cyrillic).
