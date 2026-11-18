import { Suspense } from 'react';

import { CashflowPanel } from '@/components/dashboard/cashflow-panel';
import { CategoryPanels } from '@/components/dashboard/category-panels';
import { EngagementPanels } from '@/components/dashboard/engagement-panels';
import { HeatmapPanel } from '@/components/dashboard/heatmap-panel';
import { KpiRow, KpiRowSkeleton } from '@/components/dashboard/kpi-row';
import { RangeTabs } from '@/components/dashboard/range-tabs';
import { RecentSignups } from '@/components/dashboard/recent-signups';
import { TopUsersPanel } from '@/components/dashboard/top-users-panel';
import { PageHeader } from '@/components/ui/page-header';
import { RANGE_LABELS, parseRange } from '@/lib/range';
import { getParam } from '@/lib/search-params';

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}

function PairSkeleton({ height }: { height: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className={height} />
      <Skeleton className={height} />
    </div>
  );
}

/**
 * One period filter at the top scopes every section, so all numbers agree. Sections stream
 * in independently; switching the period keeps the current charts until the new ones arrive.
 */
export default async function DashboardPage({ searchParams }: PageProps<'/'>) {
  const days = parseRange(getParam(await searchParams, 'range'));

  return (
    <>
      <PageHeader
        title="Хянах самбар"
        description={`Хэтэвч аппын төлөв · сүүлийн ${RANGE_LABELS[days]}`}
        actions={<RangeTabs active={days} />}
      />

      <Suspense fallback={<KpiRowSkeleton />}>
        <KpiRow days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[420px]" />}>
        <CashflowPanel days={days} />
      </Suspense>

      <Suspense fallback={<PairSkeleton height="h-80" />}>
        <EngagementPanels days={days} />
      </Suspense>

      <Suspense fallback={<PairSkeleton height="h-96" />}>
        <CategoryPanels days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <HeatmapPanel days={days} />
      </Suspense>

      <div className="grid items-start gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <TopUsersPanel days={days} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <RecentSignups />
        </Suspense>
      </div>
    </>
  );
}
