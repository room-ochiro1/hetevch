import { AgeTable } from '@/components/research/age-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { AGE_BANDS, AGE_BAND_LABELS } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import { formatCount } from '@/lib/format';
import type { RangeDays } from '@/lib/range';

/** Who uses the app by age, and how each age band earns, spends and saves. */
export async function AgePanel({ days }: { days: RangeDays }) {
  const { bands } = await getResearch(days);
  const total = bands.reduce((sum, band) => sum + band.users, 0);
  const counts = AGE_BANDS.map((band) => ({
    band,
    users: bands.find((row) => row.band === band)?.users ?? 0,
  }));
  const max = Math.max(1, ...counts.map((c) => c.users));

  return (
    <Panel
      title="Насны бүлгүүд"
      description={`Хэдэн настай хүмүүс ашиглаж, хэр их зарцуулж, хадгалж байна · сүүлийн ${days} хоног`}
    >
      {total === 0 ? (
        <EmptyState
          title="Хэрэглэгч алга"
          hint="Хэрэглэгчид аппаа нээж нэр, төрсөн оноо оруулахад насны бүлгээрээ энд харагдана."
        />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
          <ol className="flex flex-col gap-3" aria-label="Насны бүлэг бүрийн хэрэглэгчийн тоо">
            {counts.map(({ band, users }) => (
              <li key={band} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={band === 'unknown' ? 'text-muted' : 'font-medium'}>
                    {AGE_BAND_LABELS[band]}
                  </span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{formatCount(users)}</span>
                    <span className="ml-1.5 text-xs text-muted">
                      {total > 0 ? Math.round((users / total) * 100) : 0}%
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${band === 'unknown' ? 'bg-muted/50' : 'bg-chart-1'}`}
                    style={{ width: `${users > 0 ? Math.max(2, (users / max) * 100) : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
          <AgeTable bands={bands} />
        </div>
      )}
    </Panel>
  );
}
