import { Suspense, type ReactNode } from 'react';

import { AdminGate } from '@/components/admin/admin-gate';
import { PageSkeleton } from '@/components/admin/page-skeleton';
import { MobileHeader, Sidebar } from '@/components/admin/sidebar';

/** The app frame: a rounded light panel on a darker canvas, icon rail on the left. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas md:p-3">
      <div className="flex flex-1 flex-col bg-background md:flex-row md:rounded-[28px] md:shadow-card">
        <Sidebar />
        <MobileHeader />
        <main className="min-w-0 flex-1 px-4 py-6 md:py-7 md:pr-7 md:pl-1">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
            {/* The session read streams in here; the navigation shell renders instantly. */}
            <Suspense fallback={<PageSkeleton />}>
              <AdminGate>{children}</AdminGate>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
