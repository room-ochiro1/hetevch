---
name: deploy
description: Deploy Hetevch — the admin dashboard to Vercel, the database to hosted Supabase, and the mobile app with EAS Build/Submit/Update. Use when the user asks to deploy, release, publish, ship, or set up production.
---

# Deploy

Deploying is outward-facing: confirm with the user before every push, deploy, build submission or store upload.

## 1. Supabase (hosted)

1. User creates a project at supabase.com and gives you the project ref.
2. `pnpm exec supabase login` (user runs it — it opens a browser), then `pnpm exec supabase link --project-ref <ref>`.
3. `pnpm exec supabase db push` applies `supabase/migrations/*`.
4. Make the owner an admin (SQL editor in the Supabase dashboard):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = '<owner email>');
   ```
5. Auth → URL Configuration: add the Vercel domain and `hetevch://**` to redirect URLs.

## 2. Web → Vercel

- Import the Git repo in Vercel. **Root Directory: `apps/web`**. Framework: Next.js (auto). Vercel detects pnpm workspaces and installs from the repo root.
- Environment variables (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Any new build-time variable must also be listed in `turbo.json` → `tasks.build.env`.
- `apps/web/vercel.json` uses `turbo-ignore` so web is not rebuilt when only mobile changed.
- CLI alternative: `npx vercel link` then `npx vercel --prod` from `apps/web`.

## 3. Mobile → EAS

Run from `apps/mobile` with `npx eas-cli@latest <command>`:

1. `login`, then `init` (links the Expo project; writes the project id into app config).
2. Set env for builds: `env:create --name EXPO_PUBLIC_SUPABASE_URL --value <url> --environment production` (same for `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; also `preview`/`development`).
3. Builds: `build --profile development` (dev client), `build --profile preview` (internal testers), `build --profile production --platform all` (stores).
4. Stores: `submit --platform ios` / `--platform android` (needs Apple Developer and Google Play accounts).
5. JS-only fixes: `update --channel production --message "<what changed>"`.

Bundle id / package: `mn.hetevch.app` (in `app.json`) — confirm with the user before the first store build; it cannot be changed after publishing.
