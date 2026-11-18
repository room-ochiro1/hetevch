import { Suspense } from 'react';

import { CashflowPanel } from '@/components/dashboard/cashflow-panel';
import { CategoryPanels } from '@/components/dashboard/category-panels';
import { EngagementPanels } from '@/components/dashboard/engagement-panels';
import { HeatmapPanel } from '@/components/dashboard/heatmap-panel';
import { KpiRow, KpiRowSkeleton } from '@/components/dashboard/kpi-row';
import { RangeTabs } from '@/components/dashboard/range-tabs';
import { RecentSignups } from '@/components/dashboard/recent-signups';
import { TopUsersPanel } from '@/components/dashboard/top-users-panel';
import { DetailHost } from '@/components/detail/detail-host';
import { AgeFilter, BandNotice } from '@/components/filters/age-filter';
import { SexFilter } from '@/components/filters/sex-filter';
import { PageHeader } from '@/components/ui/page-header';
import { AGE_BAND_LABELS } from '@/lib/age-bands';
import { parseDetail, parseFilters } from '@/lib/filters';
import { RANGE_LABELS } from '@/lib/range';
import { SEX_LABELS } from '@/lib/sex';

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
  const params = await searchParams;
  const filters = parseFilters(params);
  const { days, band } = filters;
  const ctx = { basePath: '/', filters };

  return (
    <>
      <PageHeader
        title="Хянах самбар"
        description={`Хэтэвч аппын төлөв · сүүлийн ${RANGE_LABELS[days]} · ${band ? AGE_BAND_LABELS[band] : 'бүх нас'} · ${filters.sex ? SEX_LABELS[filters.sex] : 'бүх хүйс'} · дурын тоо, багана дээр дарж задална`}
        actions={<RangeTabs filters={filters} />}
      />
      <AgeFilter filters={filters} basePath="/" />
      <SexFilter filters={filters} basePath="/" />
      <BandNotice filters={filters} basePath="/" />

      <Suspense fallback={<KpiRowSkeleton />}>
        <KpiRow filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[420px]" />}>
        <CashflowPanel filters={filters} />
      </Suspense>

      <Suspense fallback={<PairSkeleton height="h-80" />}>
        <EngagementPanels filters={filters} />
      </Suspense>

      <Suspense fallback={<PairSkeleton height="h-96" />}>
        <CategoryPanels filters={filters} />
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
