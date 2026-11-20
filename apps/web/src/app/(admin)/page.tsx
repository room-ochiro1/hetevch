import { Suspense } from 'react';

import { AttentionPanel } from '@/components/dashboard/attention-panel';
import { PageSkeleton } from '@/components/admin/page-skeleton';
import { BandDriftPanel } from '@/components/dashboard/band-drift-panel';
import { CashflowPanel } from '@/components/dashboard/cashflow-panel';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EngagementPanels } from '@/components/dashboard/engagement-panels';
import { HeatmapPanel } from '@/components/dashboard/heatmap-panel';
import { KpiRow, KpiRowSkeleton } from '@/components/dashboard/kpi-row';
import { MoneyFlowPanel } from '@/components/dashboard/money-flow-panel';
import { RecentSignups } from '@/components/dashboard/recent-signups';
import { RhythmPanel } from '@/components/dashboard/rhythm-panel';
import { SpendPanel } from '@/components/dashboard/spend-panel';
import { TopUsersPanel } from '@/components/dashboard/top-users-panel';
import { DetailHost } from '@/components/detail/detail-host';
import { FilterBar } from '@/components/filters/filter-bar';
import { parseDetail, parseFilters } from '@/lib/filters';

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden className={`animate-pulse rounded-3xl bg-surface-2 ${className}`} />;
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
 * The page shell renders at once; everything that reads the URL (?range, ?age, ?sex, ?detail)
 * is inside Suspense, so a navigation shows the skeleton instantly instead of waiting.
 */
export default function DashboardPage({ searchParams }: PageProps<'/'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

/**
 * The filters at the top scope every section, so all numbers agree. Top to bottom: headline
 * numbers → when people use the app and what needs a look → where the money goes → trends.
 * Any number, bar or row opens a detail dialog; sections stream in on their own.
 */
async function Dashboard({ searchParams }: Pick<PageProps<'/'>, 'searchParams'>) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const ctx = { basePath: '/', filters };

  return (
    <>
      <DashboardHeader filters={filters} />
      <FilterBar filters={filters} basePath="/" />

      <Suspense fallback={<KpiRowSkeleton />}>
        <KpiRow filters={filters} />
      </Suspense>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Suspense fallback={<Skeleton className="h-[520px]" />}>
          <RhythmPanel filters={filters} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[520px]" />}>
          <AttentionPanel filters={filters} />
        </Suspense>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <BandDriftPanel filters={filters} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <SpendPanel filters={filters} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96 lg:col-span-2 xl:col-span-1" />}>
          <MoneyFlowPanel filters={filters} />
        </Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-[420px]" />}>
        <CashflowPanel filters={filters} />
      </Suspense>

      <Suspense fallback={<PairSkeleton height="h-80" />}>
        <EngagementPanels filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <HeatmapPanel filters={filters} />
      </Suspense>

      <div className="grid items-start gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <TopUsersPanel filters={filters} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <RecentSignups />
        </Suspense>
      </div>

      <DetailHost detail={parseDetail(params)} ctx={ctx} />
    </>
  );
}
