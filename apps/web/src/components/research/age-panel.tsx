import Link from 'next/link';

import { AgeTable } from '@/components/research/age-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { AGE_BANDS, AGE_BAND_LABELS, type AgeBand } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import { formatCount } from '@/lib/format';
import { filterHref, type Filters } from '@/lib/filters';

/**
 * Who uses the app by age, and how each age band earns, spends and saves. Always shows every
 * band (the chosen one is highlighted), and each band opens its own detail dialog.
 */
export async function AgePanel({ filters }: { filters: Filters }) {
  const { days, band: selected, sex } = filters;
  const { allBands } = await getResearch(days, selected, sex);
  const total = allBands.reduce((sum, row) => sum + row.users, 0);
  const counts = AGE_BANDS.map((band) => ({
    band,
    users: allBands.find((row) => row.band === band)?.users ?? 0,
  }));
  const max = Math.max(1, ...counts.map((c) => c.users));
  const hrefFor = (band: AgeBand) => filterHref('/research', filters, { type: 'band', band });

  return (
    <Panel
      title="Насны бүлгүүд"
      description={`Хэдэн настай хүмүүс ашиглаж, хэр их зарцуулж, хадгалж байна · сүүлийн ${days} хоног · бүлэг дээр дарж задална`}
    >
      {total === 0 ? (
        <EmptyState
          title="Хэрэглэгч алга"
          hint="Хэрэглэгчид аппаа нээж нэр, төрсөн оноо оруулахад насны бүлгээрээ энд харагдана."
        />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
          <ol className="flex flex-col gap-1" aria-label="Насны бүлэг бүрийн хэрэглэгчийн тоо">
            {counts.map(({ band, users }) => {
              const dim = selected !== null && selected !== band;
              return (
                <li key={band}>
                  <Link
                    href={hrefFor(band)}
                    scroll={false}
                    className={`-mx-2 flex flex-col gap-1 rounded-lg px-2 py-1.5 hover:bg-surface-2 ${dim ? 'opacity-50' : ''}`}
                  >
                    <span className="flex items-baseline justify-between gap-3 text-sm">
                      <span className={band === 'unknown' ? 'text-muted' : 'font-medium'}>
                        {AGE_BAND_LABELS[band]}
                      </span>
                      <span className="tabular-nums">
                        <span className="font-semibold">{formatCount(users)}</span>
                        <span className="ml-1.5 text-xs text-muted">{Math.round((users / total) * 100)}%</span>
                      </span>
                    </span>
                    <span className="block h-2 rounded-full bg-surface-2">
                      <span
                        className={`block h-full rounded-full ${band === 'unknown' ? 'bg-muted/50' : 'bg-chart-1'}`}
                        style={{ width: `${users > 0 ? Math.max(2, (users / max) * 100) : 0}%` }}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <AgeTable bands={allBands} selected={selected} hrefFor={hrefFor} />
        </div>
      )}
    </Panel>
  );
}
