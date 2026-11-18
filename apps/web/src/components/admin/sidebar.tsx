import { Suspense } from 'react';

import { Brand } from '@/components/admin/brand';
import { NavLinks } from '@/components/admin/nav-links';
import { SignOutButton } from '@/components/admin/sign-out-button';
import { requireAdmin } from '@/lib/dal/auth';

async function CurrentAdmin() {
  const admin = await requireAdmin();
  const name = admin.fullName ?? admin.email ?? 'Админ';

  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold uppercase">
        {name.slice(0, 1)}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-medium">{name}</p>
        {admin.fullName && admin.email ? (
          <p className="truncate text-xs text-muted">{admin.email}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Desktop sidebar (md and up). Fixed to the viewport so it never scrolls with the page;
 * the spacer keeps its width in the layout's flex row.
 */
export function Sidebar() {
  return (
    <>
      <div aria-hidden className="hidden w-64 shrink-0 md:block" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 overflow-y-auto border-r border-border bg-surface p-5 md:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <Suspense fallback={<div className="h-8 animate-pulse rounded-lg bg-surface-2" />}>
            <CurrentAdmin />
          </Suspense>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}

/** Top bar with horizontal navigation for small screens; stays pinned while scrolling. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border bg-surface p-4 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Brand />
        <SignOutButton compact />
      </div>
      <NavLinks orientation="horizontal" />
    </header>
  );
}
