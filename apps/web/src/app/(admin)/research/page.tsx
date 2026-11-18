import { Suspense } from 'react';

import { RangeTabs } from '@/components/dashboard/range-tabs';
import { AgePanel } from '@/components/research/age-panel';
import { ResearchKpis, ResearchKpisSkeleton } from '@/components/research/research-kpis';
import { SavingsCardsTable } from '@/components/research/savings-cards-table';
import { SavingsPanels } from '@/components/research/savings-panels';
import { SpendingPanel } from '@/components/research/spending-panel';
import { WeekdayPanels } from '@/components/research/weekday-panels';
import { PageHeader } from '@/components/ui/page-header';
import { RANGE_LABELS, parseRange } from '@/lib/range';
import { getParam } from '@/lib/search-params';

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}

/**
 * Судалгаа: who the users are (age), what they spend on and on which weekday, and how they
 * save. One period filter scopes every section; sections stream in on their own and share
 * one cached round of queries (getResearch). Admin accounts are left out of every number.
 */
export default async function ResearchPage({ searchParams }: PageProps<'/research'>) {
  const days = parseRange(getParam(await searchParams, 'range'));

  return (
    <>
      <PageHeader
        title="Судалгаа"
        description={`Насны бүлэг, зарцуулалт, хадгаламж · сүүлийн ${RANGE_LABELS[days]} · зөвхөн хэрэглэгчид (админ ороогүй)`}
        actions={<RangeTabs active={days} basePath="/research" />}
      />

      <Suspense fallback={<ResearchKpisSkeleton />}>
        <ResearchKpis days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <AgePanel days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <SpendingPanel days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <WeekdayPanels days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-80" />}>
        <SavingsPanels days={days} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <SavingsCardsTable days={days} />
      </Suspense>
    </>
  );
}
