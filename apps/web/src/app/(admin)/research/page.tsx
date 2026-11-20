import { Suspense } from 'react';

import { AgePanel } from '@/components/research/age-panel';
import { GenderPanel } from '@/components/research/gender-panel';
import { ResearchKpis, ResearchKpisSkeleton } from '@/components/research/research-kpis';
import { SavingsCardsTable } from '@/components/research/savings-cards-table';
import { SavingsPanels } from '@/components/research/savings-panels';
import { SpendingPanel } from '@/components/research/spending-panel';
import { WeekdayPanels } from '@/components/research/weekday-panels';
import { DetailHost } from '@/components/detail/detail-host';
import { FilterBar } from '@/components/filters/filter-bar';
import { PageHeader } from '@/components/ui/page-header';
import { AGE_BAND_LABELS } from '@/lib/age-bands';
import { parseDetail, parseFilters } from '@/lib/filters';
import { RANGE_LABELS } from '@/lib/range';
import { SEX_LABELS } from '@/lib/sex';

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden className={`animate-pulse rounded-3xl bg-surface-2 ${className}`} />;
}

/**
 * Судалгаа: who the users are (age, gender), what they spend on and on which weekday, and how they
 * save. One period filter scopes every section; sections stream in on their own and share
 * one cached round of queries (getResearch). Admin accounts are left out of every number.
 */
export default async function ResearchPage({ searchParams }: PageProps<'/research'>) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const { days, band } = filters;
  const ctx = { basePath: '/research', filters };

  return (
    <>
      <PageHeader
        title="Судалгаа"
        description={`Насны бүлэг, зарцуулалт, хадгаламж · сүүлийн ${RANGE_LABELS[days]} · ${band ? AGE_BAND_LABELS[band] : 'бүх нас'} · ${filters.sex ? SEX_LABELS[filters.sex] : 'бүх хүйс'} · зөвхөн хэрэглэгчид (админ ороогүй)`}
      />
      <FilterBar filters={filters} basePath="/research" />

      <Suspense fallback={<ResearchKpisSkeleton />}>
        <ResearchKpis filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <AgePanel filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[640px]" />}>
        <GenderPanel filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <SpendingPanel filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <WeekdayPanels filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <SavingsPanels filters={filters} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <SavingsCardsTable filters={filters} />
      </Suspense>

      <DetailHost detail={parseDetail(params)} ctx={ctx} />
    </>
  );
}
