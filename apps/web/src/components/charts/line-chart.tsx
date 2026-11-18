'use client';

import type { MouseEvent } from 'react';

import { ChartTooltip, DataTable, TooltipRow, YTicks } from '@/components/charts/chart-parts';
import { useChartCursor } from '@/components/charts/use-chart-cursor';
import { formatTick, niceMax } from '@/lib/chart-scale';
import { formatCount, formatShortDay } from '@/lib/format';

export type LinePoint = { day: string; value: number };

/** One series over time: a 2px line over a 10% wash, a crosshair that snaps to the nearest day. */
export function LineChart({ data, label, unit }: { data: LinePoint[]; label: string; unit: string }) {
  const { active, setActive, plotProps } = useChartCursor(data.length);
  const top = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const span = Math.max(1, data.length - 1);
  const x = (index: number) => (index / span) * 100;
  const y = (value: number) => 100 - (value / top) * 100;
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ');
  const area = data.length > 0 ? `${line} L100,100 L0,100 Z` : '';
  const last = data.at(-1);
  const point = active === null ? null : data[active];

  function track(event: MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setActive(Math.round(ratio * span));
  }

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex pt-2">
        <YTicks
          ticks={[
            { label: formatTick(top), at: 0 },
            { label: formatTick(top / 2), at: 50 },
            { label: '0', at: 100 },
          ]}
        />
        <div
          {...plotProps}
          onMouseMove={track}
          role="img"
          aria-label={`${label}. Сум товчоор өдөр сонгоно.`}
          className="relative h-44 flex-1 rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
        >
          {[0, 50, 100].map((pos) => (
            <div key={pos} aria-hidden className="absolute inset-x-0 border-t border-border" style={{ top: `${pos}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <path d={area} className="fill-chart-1" opacity={0.1} />
            <path
              d={line}
              fill="none"
              className="stroke-chart-1"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {last ? <Dot left={100} top={y(last.value)} /> : null}
          {last && active === null ? (
            // End label sits on the side the line isn't coming from, so it never crosses it.
            <span
              className={`absolute right-2 text-xs font-semibold tabular-nums ${
                (data.at(-2)?.value ?? 0) <= last.value ? '-translate-y-[calc(100%+6px)]' : 'translate-y-[6px]'
              }`}
              style={{ top: `${y(last.value)}%` }}
            >
              {formatCount(last.value)}
            </span>
          ) : null}
          {point && active !== null ? (
            <>
              <div aria-hidden className="absolute inset-y-0 w-px bg-muted/50" style={{ left: `${x(active)}%` }} />
              <Dot left={x(active)} top={y(point.value)} />
              <ChartTooltip position={x(active) / 100}>
                <p className="mb-1 text-muted">{formatShortDay(point.day)}</p>
                <TooltipRow swatch="bg-chart-1" label={unit} value={formatCount(point.value)} />
              </ChartTooltip>
            </>
          ) : null}
        </div>
      </div>
      <div aria-hidden className="ml-16 flex justify-between text-[11px] text-muted">
        <span>{data[0] ? formatShortDay(data[0].day) : ''}</span>
        <span>{last ? formatShortDay(last.day) : ''}</span>
      </div>
      <DataTable
        caption={label}
        head={['Өдөр', unit]}
        rows={data.map((d) => [formatShortDay(d.day), formatCount(d.value)])}
      />
    </figure>
  );
}

/** 8px marker with a 2px surface ring, so it stays legible where it sits on the line. */
function Dot({ left, top }: { left: number; top: number }) {
  return (
    <span
      aria-hidden
      className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-chart-1"
      style={{ left: `${left}%`, top: `${top}%` }}
    />
  );
}
