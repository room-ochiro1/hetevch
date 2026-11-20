import { Suspense } from 'react';

import { RadialClock } from '@/components/charts/radial-clock';
import { ActivityFeed, ActivityFeedSkeleton } from '@/components/dashboard/activity-feed';
import { Pill } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { getActivityHeatmap } from '@/lib/dal/analytics';
import { formatCount } from '@/lib/format';
import type { Filters } from '@/lib/filters';
import { ulaanbaatarClock } from '@/lib/greeting';
import { RANGE_LABELS } from '@/lib/range';

const PARTS = [
  { label: 'Шөнө', from: 0 },
  { label: 'Өглөө', from: 6 },
  { label: 'Өдөр', from: 12 },
  { label: 'Орой', from: 18 },
] as const;

const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** Share of the day's entries in each quarter (night, morning, afternoon, evening). */
function DayParts({ hours }: { hours: number[] }) {
  const total = hours.reduce((sum, count) => sum + count, 0);
  const shares = PARTS.map((part) => hours.slice(part.from, part.from + 6).reduce((s, c) => s + c, 0));
  const best = Math.max(...shares);
  return (
    <dl className="grid grid-cols-4 gap-2">
      {PARTS.map((part, index) => (
        <div key={part.label} className="rounded-2xl bg-surface-2/70 px-3 py-2.5">
          <dt className="text-[11px] text-muted">
            {part.label} <span className="tabular-nums">{pad(part.from).slice(0, 2)}–{pad(part.from + 6).slice(0, 2)}</span>
          </dt>
          <dd className={`text-base font-semibold tabular-nums ${shares[index] === best && best > 0 ? 'text-foreground' : 'text-muted'}`}>
            {total > 0 ? Math.round(((shares[index] ?? 0) / total) * 100) : 0}%
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** When in the day people use the app (clock), and what just happened (feed). */
export async function RhythmPanel({ filters }: { filters: Filters }) {
  const cells = await getActivityHeatmap(filters.days, filters.band, filters.sex);
  const hours = Array.from({ length: 24 }, (_, hour) =>
    cells.filter((cell) => cell.hour === hour).reduce((sum, cell) => sum + cell.count, 0),
  );
  const peakCount = Math.max(...hours);
  const peak = hours.indexOf(peakCount);

  return (
    <Panel
      title="Өдрийн хэмнэл"
      description="Хэрэглэгчид өдрийн аль цагт гүйлгээ бүртгэдэг вэ · цаг бүр нэг багана"
      action={<Pill>{RANGE_LABELS[filters.days]}</Pill>}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <RadialClock
            hours={hours}
            now={ulaanbaatarClock()}
            label={`Сүүлийн ${filters.days} хоногт цаг тус бүрд бүртгэсэн гүйлгээ`}
          />
          <DayParts hours={hours} />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <ul className="flex flex-wrap gap-2 text-xs">
            <li className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1">
              <span aria-hidden className="size-2 rounded-full bg-chart-1/70" /> Бүртгэсэн цаг
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1">
              <span aria-hidden className="size-2 rounded-full bg-ink" />
              {peakCount > 0 ? `Оргил ${pad(peak)} · ${formatCount(peakCount)} гүйлгээ` : 'Оргил цаг алга'}
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1">
              <span aria-hidden className="h-0.5 w-3 rounded bg-ink" /> Одоо
            </li>
          </ul>
          <h3 className="mt-1 text-sm font-semibold">
            Сүүлийн үйл явдал <span className="font-normal text-muted">· бүх хэрэглэгч</span>
          </h3>
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </Panel>
  );
}
