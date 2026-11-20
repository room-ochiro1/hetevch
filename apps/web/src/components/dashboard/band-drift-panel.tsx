import Link from 'next/link';

import { Pill } from '@/components/ui/badge';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Panel } from '@/components/ui/panel';
import { AGE_BAND_LABELS, MIN_SAMPLE } from '@/lib/age-bands';
import { formatCompactMoney } from '@/lib/chart-scale';
import { getBandRows } from '@/lib/dal/band-rows';
import { formatCount } from '@/lib/format';
import { filterHref, type Filters } from '@/lib/filters';

/** Within ±ZONE of the average counts as "usual"; the plot spans ±LIMIT. */
const ZONE = 0.25;
const LIMIT = 1;

const position = (diff: number) => ((Math.max(-LIMIT, Math.min(LIMIT, diff)) + LIMIT) / (2 * LIMIT)) * 100;

/**
 * How each age band's spending per active person compares with the average of everyone:
 * a dot right of the line spends more, left spends less; the shaded zone is "about average".
 */
export async function BandDriftPanel({ filters }: { filters: Filters }) {
  const rows = (await getBandRows(filters.days, filters.sex)).filter((row) => row.activeUsers > 0);
  const active = rows.reduce((sum, row) => sum + row.activeUsers, 0);
  const average = active > 0 ? rows.reduce((sum, row) => sum + row.expense, 0) / active : 0;
  const bands = rows.map((row) => {
    const perPerson = row.expense / row.activeUsers;
    return { ...row, perPerson, diff: average > 0 ? perPerson / average - 1 : 0 };
  });
  const usual = bands.filter((band) => Math.abs(band.diff) <= ZONE).length;

  return (
    <Panel
      title="Насны бүлгийн зөрүү"
      description="Нэг идэвхтэй хүний зарлага дунджаас хэр зөрөх вэ"
      action={<Pill>Дундаж {formatCompactMoney(average)}</Pill>}
      className="h-full"
    >
      {bands.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Энэ хугацаанд идэвхтэй хэрэглэгч алга</p>
      ) : (
        <div className="flex flex-col gap-1">
          <div aria-hidden className="relative ml-[104px] mr-14 mb-1 h-4 text-[10px] text-muted">
            <span className="absolute left-0">−100%</span>
            <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-foreground">Дундаж</span>
            <span className="absolute right-0">+100%</span>
          </div>
          {bands.map((band) => {
            const x = position(band.diff);
            const few = band.activeUsers < MIN_SAMPLE;
            const outside = Math.abs(band.diff) > ZONE;
            return (
              <Link
                key={band.band}
                href={filterHref('/', filters, { type: 'band', band: band.band })}
                scroll={false}
                className={`-mx-2 flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-2 ${few ? 'opacity-55' : ''} ${filters.band === band.band ? 'bg-surface-2' : ''}`}
                title={`${formatCount(band.activeUsers)} идэвхтэй · ${formatCompactMoney(band.perPerson)}/хүн${few ? ' · цөөн хүн, итгэл багатай' : ''}`}
              >
                <span className="w-[96px] shrink-0">
                  <span className="block text-sm font-medium">{AGE_BAND_LABELS[band.band]}</span>
                  <span className="block text-[11px] text-muted tabular-nums">{formatCompactMoney(band.perPerson)}/хүн</span>
                </span>
                <span className="relative h-7 flex-1">
                  <span aria-hidden className="absolute inset-y-0 rounded-md bg-income-soft" style={{ left: `${position(-ZONE)}%`, right: `${100 - position(ZONE)}%` }} />
                  <span aria-hidden className="absolute top-1/2 left-0 h-px w-full bg-border" />
                  <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink/60" />
                  <span aria-hidden className={`absolute top-1/2 h-0.5 -translate-y-1/2 ${outside ? 'bg-warn/60' : 'bg-muted/40'}`} style={{ left: `${Math.min(50, x)}%`, width: `${Math.abs(x - 50)}%` }} />
                  <span aria-hidden className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface ${outside ? 'bg-warn' : 'bg-chart-1'}`} style={{ left: `${x}%` }} />
                </span>
                <span className={`w-12 shrink-0 text-right text-xs font-semibold tabular-nums ${outside ? 'text-warn' : 'text-muted'}`}>
                  {band.diff >= 0 ? '+' : '−'}
                  {Math.round(Math.abs(band.diff) * 100)}%
                </span>
              </Link>
            );
          })}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted">
              <span aria-hidden className="h-2 w-4 rounded-sm bg-income-soft ring-1 ring-income/20" />
              {usual}/{bands.length} бүлэг дунджийн ±{ZONE * 100}%-д
            </span>
            <Link href={filterHref('/', filters, { type: 'bands' })} scroll={false} className="flex items-center gap-0.5 font-semibold hover:underline">
              Бүлгүүдийг задлах <ChevronRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </Panel>
  );
}
