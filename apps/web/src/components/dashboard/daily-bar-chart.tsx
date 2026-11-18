'use client';

import { formatMoney } from '@hetevch/shared';
import { useState } from 'react';

import { formatCount, formatShortDay } from '@/lib/format';

export type DailyPoint = { day: string; value: number };

type DailyBarChartProps = {
  /** Series name, used in the tooltip and the screen-reader table. */
  label: string;
  data: DailyPoint[];
  unit: 'count' | 'money';
};

/** Single-series daily bar chart with a hover/focus tooltip and an accessible table. */
export function DailyBarChart({ label, data, unit }: DailyBarChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const format = unit === 'money' ? formatMoney : formatCount;
  const max = Math.max(1, ...data.map((point) => point.value));
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const activePoint = active === null ? null : data[active];

  // Keep the tooltip inside the plot near the edges.
  const position = active === null ? 0 : (active + 0.5) / data.length;
  const align = position < 0.2 ? 'translate-x-0' : position > 0.8 ? '-translate-x-full' : '-translate-x-1/2';

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative h-44 pt-6">
        <span className="absolute top-0 right-0 text-[11px] text-muted tabular-nums">{format(max)}</span>
        <div className="absolute inset-x-0 top-6 border-t border-border" aria-hidden />
        <div
          className="flex h-full items-end gap-[2px] border-b border-border"
          onMouseLeave={() => setActive(null)}
          role="img"
          aria-label={`${label}: сүүлийн ${data.length} хоногт нийт ${format(total)}`}
        >
          {data.map((point, index) => (
            <button
              key={point.day}
              type="button"
              tabIndex={-1}
              className="flex h-full flex-1 cursor-default items-end justify-center"
              onMouseEnter={() => setActive(index)}
              aria-hidden
            >
              <span
                className="w-full max-w-6 rounded-t-[4px] bg-chart-1 transition-opacity"
                style={{
                  height: `${(point.value / max) * 100}%`,
                  minHeight: point.value > 0 ? 2 : 0,
                  opacity: active === null || active === index ? 1 : 0.4,
                }}
              />
            </button>
          ))}
        </div>
        {activePoint ? (
          <div
            className={`pointer-events-none absolute top-0 z-10 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-md ${align}`}
            style={{ left: `${position * 100}%` }}
          >
            <p className="text-muted">{formatShortDay(activePoint.day)}</p>
            <p className="font-semibold tabular-nums">
              {label}: {format(activePoint.value)}
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex justify-between text-[11px] text-muted" aria-hidden>
        <span>{data[0] ? formatShortDay(data[0].day) : ''}</span>
        <span>{data.at(-1) ? formatShortDay(data.at(-1)!.day) : ''}</span>
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((point) => (
            <tr key={point.day}>
              <th scope="row">{formatShortDay(point.day)}</th>
              <td>{format(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
