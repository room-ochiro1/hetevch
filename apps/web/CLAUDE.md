# apps/web — admin dashboard (Next.js)

@AGENTS.md

- Admin-only. Every page under `src/app/(admin)` must get its data through `src/lib/dal/*`, and every DAL function calls `requireAdmin()` first.
- `cacheComponents` is on: anything that reads cookies (every Supabase server call) must render inside `<Suspense>`. Never await the session at the top level of a layout.
- Supabase server client: `src/lib/supabase/server.ts`. Session refresh: `src/proxy.ts` (Next 16 renamed middleware to proxy).
- UI text is Mongolian (Cyrillic). Styling is Tailwind v4.
