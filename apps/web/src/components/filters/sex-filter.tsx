import { Chip } from '@/components/filters/age-filter';
import { filterHref, type Filters } from '@/lib/filters';
import { SEXES, SEX_LABELS, type Sex } from '@/lib/sex';

/**
 * Narrows every number on the page to one gender (?sex=…), like AgeFilter does for age; the two
 * combine. "Тодорхойгүй" is accounts made before gender was asked.
 */
export function SexFilter({ filters, basePath }: { filters: Filters; basePath: string }) {
  const link = (sex: Sex | null) => filterHref(basePath, { ...filters, sex });

  return (
    <nav aria-label="Хүйсээр шүүх" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted">Хүйс:</span>
      <Chip href={link(null)} selected={filters.sex === null} label="Бүх хүйс" />
      {SEXES.map((sex) => (
        <Chip key={sex} href={link(sex)} selected={filters.sex === sex} label={SEX_LABELS[sex]} />
      ))}
    </nav>
  );
}
