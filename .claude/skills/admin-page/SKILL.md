---
name: admin-page
description: Add or change a page in the Hetevch admin dashboard (apps/web, Next.js 16 with Cache Components). Use for any new admin screen, table, stat, form or Server Action in the web app.
---

# Admin dashboard page

Next.js 16.4 differs from older versions. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` (e.g. `01-app/02-guides/authentication-with-cache-components.md`, `forms.md`).

## Where things go

```
apps/web/src/app/(admin)/<route>/page.tsx   the page (server component, async)
apps/web/src/lib/dal/<area>.ts              data access: requireAdmin() then query
apps/web/src/components/admin/              reusable admin UI
apps/web/src/components/admin/nav-links.tsx sidebar links — add the new route here
```

## Steps

1. **DAL first.** Add a function to `src/lib/dal/<area>.ts`:
   ```ts
   import 'server-only';
   export async function listTransactions() {
     await requireAdmin();
     const supabase = await createClient();
     const { data, error } = await supabase.from('transactions').select('*').limit(50);
     if (error) throw new Error(`Failed to load transactions: ${error.message}`);
     return data;
   }
   ```
2. **Page.** `src/app/(admin)/<route>/page.tsx` is an async server component that calls the DAL. The `(admin)` layout already wraps pages in `<Suspense>` + `AdminGate`, and `loading.tsx` shows a skeleton.
3. If one part of a page is slow, wrap just that part in its own `<Suspense>`.
4. **Mutations** use Server Actions in a `actions.ts` next to the page (`'use server'`). Each action calls `requireAdmin()` itself, validates `FormData`, then calls `revalidatePath`/`updateTag` as needed. Forms use `useActionState` in a small client component.
5. Add the link in `nav-links.tsx`.
6. `pnpm check` and `pnpm build`.

## Rules

- Cache Components is on: anything that reads cookies (every Supabase call) must be inside `<Suspense>`. Never await the session at the top level of a layout.
- Never use the Supabase secret key for reads that RLS already allows admins to do.
- Tables: wrap in `overflow-x-auto`; format dates with `Intl.DateTimeFormat('mn-MN')` and money with `formatMoney` from `@hetevch/shared`.
- UI text in Mongolian. Tailwind tokens: `bg-surface`, `border-border`, `text-muted`, `bg-accent`.
- Keep each file ≤160 lines: split big tables into `<x>-table.tsx` + row components.
