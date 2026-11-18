import { Suspense, type ReactNode } from 'react';

import { AdminGate } from '@/components/admin/admin-gate';
import { PageSkeleton } from '@/components/admin/page-skeleton';
import { MobileHeader, Sidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {/* The session read streams in here; the navigation shell renders instantly. */}
          <Suspense fallback={<PageSkeleton />}>
            <AdminGate>{children}</AdminGate>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
