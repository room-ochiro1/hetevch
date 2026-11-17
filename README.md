# Хэтэвч

Хэрэглэгчдэд зориулсан Android/iOS апп + зөвхөн эзэмшигчид зориулсан вэб админ самбар.

| Хэсэг             | Технологи                                  | Байршуулалт |
| ----------------- | ------------------------------------------ | ----------- |
| `apps/mobile`     | Expo SDK 58, Expo Router, TypeScript       | EAS (App Store, Google Play) |
| `apps/web`        | Next.js 16, Tailwind v4, TypeScript         | Vercel      |
| `packages/shared` | Хоёр апп хуваалцах төрөл, туслах функц      | —           |
| `supabase`        | Postgres, Auth, RLS, migration              | Supabase    |

Монорепо: pnpm workspaces + Turborepo. Нэг файлд **160 мөрөөс ихгүй** код (ESLint, `pnpm check:lines`, Claude hook гурвуулаа шалгана).

## Анх удаа ажиллуулах

Шаардлага: Node 20+, pnpm (`corepack enable`), Docker Desktop (локал Supabase-д).

```bash
pnpm install
pnpm db:start            # локал Supabase асаана, URL ба publishable key хэвлэнэ
```

Түлхүүрүүдийг хуулна:

- `apps/web/.env.example` → `apps/web/.env.local`
- `apps/mobile/.env.example` → `apps/mobile/.env` (утсан дээр туршихдаа `127.0.0.1`-ийн оронд компьютерийн LAN IP)

```bash
pnpm dev:web             # http://localhost:3000 — админ самбар
pnpm dev:mobile          # Expo; a = Android, i = iOS (Mac), эсвэл QR-аар Expo Go
```

### Өөрийгөө админ болгох

1. Мобайл аппаар (эсвэл Supabase Studio → Authentication-аар) бүртгүүлнэ.
2. Supabase Studio (локал: http://127.0.0.1:54323) → SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'таны@имэйл');
   ```
3. `http://localhost:3000/login` дээр нэвтэрнэ. Админ биш хэрэглэгч `/forbidden` руу шилжинэ.

## Түгээмэл командууд

| Команд                     | Юу хийх                                      |
| -------------------------- | -------------------------------------------- |
| `pnpm check`               | 160 мөр + lint + typecheck                   |
| `pnpm build`               | Вэбийн production build                      |
| `pnpm db:migration <нэр>`  | Шинэ SQL migration                           |
| `pnpm db:reset`            | Бүх migration-ийг локалд дахин ажиллуулах    |
| `pnpm db:types`            | `packages/shared`-ийн DB төрлийг шинэчлэх    |

## Байршуулах

- **Вэб → Vercel:** Repo-г импортлоод **Root Directory = `apps/web`**. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Өгөгдлийн сан → Supabase:** `pnpm exec supabase link --project-ref <ref>` → `pnpm exec supabase db push`.
- **Мобайл → EAS:** `apps/mobile` дотроос `npx eas-cli@latest build --profile production`.

Дэлгэрэнгүйг `.claude/skills/deploy/SKILL.md`-ээс үзнэ үү.

## Claude Code тохиргоо

- `CLAUDE.md` (root + апп бүрт) — төслийн дүрэм, командууд
- `.claude/settings.json` — зөвшөөрөл, `.env` уншихыг хориглосон, 160 мөрийн hook, Expo plugin
- `.claude/skills/` — `new-feature`, `supabase-migration`, `admin-page`, `mobile-screen`, `split-file`, `deploy`
