import { Suspense, type ReactNode } from 'react';

import { AdminGate } from '@/components/admin/admin-gate';
import { PageSkeleton } from '@/components/admin/page-skeleton';
import { Sidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* The session read streams in here; the sidebar shell renders instantly. */}
        <Suspense fallback={<PageSkeleton />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}
