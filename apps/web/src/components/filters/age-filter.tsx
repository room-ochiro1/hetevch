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
      className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-surface text-muted hover:border-foreground/40 hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Narrows every number on the page to one age band (?age=…). The chosen band stays in the URL,
 * so detail dialogs and the period tabs keep it.
 */
export function AgeFilter({ filters, basePath }: { filters: Filters; basePath: string }) {
  const link = (band: AgeBand | null) => filterHref(basePath, { ...filters, band });

  return (
    <nav aria-label="Насны бүлгээр шүүх" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted">Нас:</span>
      <Chip href={link(null)} selected={filters.band === null} label="Бүх нас" />
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
    <p className="rounded-xl border border-chart-1/30 bg-chart-1/10 px-4 py-2.5 text-sm">
      Зөвхөн <strong>{who.join(', ')}</strong> хэрэглэгчдийн тоо харагдаж байна.{' '}
      <Link
        href={filterHref(basePath, { ...filters, band: null, sex: null })}
        scroll={false}
        className="font-medium underline"
      >
        Бүх хэрэглэгчээр харах
      </Link>
    </p>
  );
}
