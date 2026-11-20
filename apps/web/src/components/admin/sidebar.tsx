import { Suspense } from 'react';

import { Brand } from '@/components/admin/brand';
import { NavLinks } from '@/components/admin/nav-links';
import { SignOutButton } from '@/components/admin/sign-out-button';
import { requireAdmin } from '@/lib/dal/auth';

/** The signed-in admin as an initial; the full name and email are in its tooltip. */
async function CurrentAdmin() {
  const admin = await requireAdmin();
  const name = admin.fullName ?? admin.email ?? 'Админ';
  const title = [name, admin.fullName ? admin.email : null].filter(Boolean).join(' · ');

  return (
    <span
      title={title}
      className="relative grid size-10 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text uppercase"
    >
      {name.slice(0, 1)}
      <span aria-hidden className="absolute right-0 bottom-0 size-2.5 rounded-full bg-income ring-2 ring-background" />
    </span>
  );
}

/**
 * Desktop icon rail (md and up): logo, sections with their names under the icons, and the
 * admin at the bottom. Sticky inside the app frame, so it stays put while the page scrolls.
 */
export function Sidebar() {
  return (
    <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-[96px] shrink-0 flex-col items-center gap-7 overflow-y-auto py-6 md:flex">
      <Brand compact />
      <NavLinks />
      <div className="mt-auto flex flex-col items-center gap-2">
        <SignOutButton icon />
        <Suspense fallback={<span className="size-10 animate-pulse rounded-full bg-surface-2" />}>
          <CurrentAdmin />
        </Suspense>
      </div>
    </aside>
  );
}

/** Top bar with horizontal navigation for small screens; stays pinned while scrolling. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border bg-background/90 p-4 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Brand />
        <SignOutButton icon />
      </div>
      <NavLinks orientation="horizontal" />
    </header>
  );
}
