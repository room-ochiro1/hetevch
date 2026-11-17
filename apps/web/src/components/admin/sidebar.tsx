import { Suspense } from 'react';

import { NavLinks } from '@/components/admin/nav-links';
import { SignOutButton } from '@/components/admin/sign-out-button';
import { requireAdmin } from '@/lib/dal/auth';

async function CurrentAdmin() {
  const admin = await requireAdmin();
  return (
    <p className="truncate text-xs text-muted" title={admin.email ?? undefined}>
      {admin.fullName ?? admin.email}
    </p>
  );
}

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 border-r border-border bg-surface p-4">
      <div>
        <p className="text-lg font-semibold">Хэтэвч</p>
        <p className="text-xs text-muted">Админ самбар</p>
      </div>
      <NavLinks />
      <div className="mt-auto flex flex-col gap-2">
        <Suspense fallback={<p className="text-xs text-muted">…</p>}>
          <CurrentAdmin />
        </Suspense>
        <SignOutButton />
      </div>
    </aside>
  );
}
