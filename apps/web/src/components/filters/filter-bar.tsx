import { RangeTabs } from '@/components/dashboard/range-tabs';
import { AgeFilter, BandNotice } from '@/components/filters/age-filter';
import { SexFilter } from '@/components/filters/sex-filter';
import type { Filters } from '@/lib/filters';

/**
 * One toolbar for everything that scopes the page: period, age band, gender. All three live in
 * the URL, so a view survives reloads and can be shared.
 */
export function FilterBar({ filters, basePath }: { filters: Filters; basePath: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-3xl bg-surface p-2.5 pr-4 shadow-card">
        <RangeTabs filters={filters} basePath={basePath} />
        <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
        <AgeFilter filters={filters} basePath={basePath} />
        <span aria-hidden className="hidden h-6 w-px bg-border xl:block" />
        <SexFilter filters={filters} basePath={basePath} />
      </div>
      <BandNotice filters={filters} basePath={basePath} />
    </>
  );
}
