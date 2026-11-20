import Link from 'next/link';

import { AGE_BANDS, AGE_BAND_LABELS, type AgeBand } from '@/lib/age-bands';
import { filterHref, type Filters } from '@/lib/filters';
import type { Sex } from '@/lib/sex';

export function Chip({ href, selected, label }: { href: string; selected: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? 'true' : undefined}
      className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
        selected ? 'bg-ink text-on-ink' : 'bg-surface-2 text-muted hover:bg-border hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  );
}

/** The small caption in front of a chip group ("Нас", "Хүйс"). */
export function FilterLabel({ children }: { children: string }) {
  return <span className="mr-0.5 text-xs font-semibold text-foreground">{children}</span>;
}

/**
 * Narrows every number on the page to one age band (?age=…). The chosen band stays in the URL,
 * so detail dialogs and the period tabs keep it.
 */
export function AgeFilter({ filters, basePath }: { filters: Filters; basePath: string }) {
  const link = (band: AgeBand | null) => filterHref(basePath, { ...filters, band });

  return (
    <nav aria-label="Насны бүлгээр шүүх" className="flex flex-wrap items-center gap-1.5">
      <FilterLabel>Нас</FilterLabel>
      <Chip href={link(null)} selected={filters.band === null} label="Бүгд" />
      {AGE_BANDS.map((band) => (
        <Chip key={band} href={link(band)} selected={filters.band === band} label={AGE_BAND_LABELS[band]} />
      ))}
    </nav>
  );
}

/** "эрэгтэй" etc., for the sentence in BandNotice. */
const SEX_PEOPLE: Record<Sex, string> = {
  male: 'эрэгтэй',
  female: 'эмэгтэй',
  unknown: 'хүйсээ оруулаагүй',
};

/** A one-line note under the header while an age band or gender is chosen, with a way back. */
export function BandNotice({ filters, basePath }: { filters: Filters; basePath: string }) {
  if (!filters.band && !filters.sex) return null;
  const who = [
    filters.band ? `${AGE_BAND_LABELS[filters.band]}-ийн` : null,
    filters.sex ? SEX_PEOPLE[filters.sex] : null,
  ].filter(Boolean);
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-accent-soft px-4 py-2.5 text-sm text-accent-text">
      <span>
        Зөвхөн <strong>{who.join(', ')}</strong> хэрэглэгчдийн тоо харагдаж байна.
      </span>
      <Link
        href={filterHref(basePath, { ...filters, band: null, sex: null })}
        scroll={false}
        className="font-semibold underline underline-offset-2"
      >
        Бүх хэрэглэгчээр харах
      </Link>
    </p>
  );
}
