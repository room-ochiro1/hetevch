---
name: new-feature
description: Build a complete Hetevch feature across the stack (database, shared types, admin dashboard, mobile app). Use when the user asks for a feature like "add transactions", "add categories", "users can create budgets" that needs both data and UI.
---

# New feature, end to end

Work in this order so each layer builds on a checked one. Ask the user only when a product decision is genuinely unclear (e.g. what fields a record needs).

1. **Plan** (short): the table(s) and columns, who can read/write (user vs admin), which mobile screens and which admin views.
2. **Database** → follow the `supabase-migration` skill: migration with RLS, `pnpm db:reset`, `pnpm db:types`, aliases in `packages/shared/src/index.ts`.
3. **Shared logic** → pure helpers both apps need (formatting, validation) in `packages/shared/src/<topic>.ts`, exported from `index.ts`.
4. **Mobile** → follow the `mobile-screen` skill: hook(s) + screen(s) for users.
5. **Admin** → follow the `admin-page` skill: DAL function(s) + page; add to the sidebar.
6. **Verify**: `pnpm check` and `pnpm build`. If local Supabase is running, try the flow: sign up in the app, then see the data in the admin dashboard.
7. Summarise for the user what was added and anything they must do (e.g. push the migration to the hosted project).

Keep every file ≤160 lines as you go (see `split-file`).
