'use client';

import { ChartTooltip, DataTable, TooltipRow, YTicks } from '@/components/charts/chart-parts';
import { useChartCursor } from '@/components/charts/use-chart-cursor';
import { formatTick, niceMax } from '@/lib/chart-scale';

export type Column = {
  label: string;
  value: number;
  /** The value as text, for the data table (formatted by the server: functions can't cross to a client component). */
  display: string;
  /** Tooltip rows under the label: value first, then what it is. */
  rows: { value: string; label: string }[];
};

type ColumnChartProps = {
  columns: Column[];
  label: string;
  /** One hue for every bar (a single series); Tailwind background class. */
  barClass: string;
  /** Text for the data table's value column. */
  valueLabel: string;
};

/**
 * Vertical bars on one scale from zero, thin and rounded at the data end. Only the largest
 * bar carries a printed value; hovering or ←/→ shows the rest.
 */
export function ColumnChart({ columns, label, barClass, valueLabel }: ColumnChartProps) {
  const { active, setActive, plotProps } = useChartCursor(columns.length);
  const top = niceMax(Math.max(0, ...columns.map((c) => c.value)));
  const peak = columns.reduce((best, c, i) => (c.value > (columns[best]?.value ?? 0) ? i : best), 0);
  const ticks = [
    { label: formatTick(top), at: 0 },
    { label: formatTick(top / 2), at: 50 },
    { label: '0', at: 100 },
  ];
  const point = active === null ? null : columns[active];

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex pt-6">
        <YTicks ticks={ticks} />
        <div
          {...plotProps}
          role="img"
          aria-label={`${label}. Сум товчоор багана сонгоно.`}
          className="relative h-52 flex-1 rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 border-t border-border" />
          <div aria-hidden className="absolute inset-x-0 top-1/2 border-t border-border" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 border-t border-muted/40" />
          <div className="absolute inset-0 flex">
            {columns.map((column, index) => {
              const height = (column.value / top) * 100;
              const dim = active !== null && active !== index ? 'opacity-40' : '';
              return (
                <div key={column.label} className="relative h-full flex-1" onMouseEnter={() => setActive(index)}>
                  {index === peak && column.value > 0 ? (
                    <span
                      aria-hidden
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-full pb-1 text-[11px] font-semibold whitespace-nowrap tabular-nums"
                      style={{ bottom: `${height}%` }}
                    >
                      {formatTick(column.value)}
                    </span>
                  ) : null}
                  <span
                    className={`absolute bottom-0 left-1/2 w-[60%] max-w-6 -translate-x-1/2 rounded-t-[4px] transition-opacity ${barClass} ${dim}`}
                    style={{ height: `${Math.max(column.value > 0 ? 1 : 0, height)}%` }}
                  />
                </div>
              );
            })}
          </div>
          {point && active !== null ? (
            <ChartTooltip position={(active + 0.5) / columns.length}>
              <p className="mb-1 text-muted">{point.label}</p>
              {point.rows.map((row) => (
                <TooltipRow key={row.label} label={row.label} value={row.value} />
              ))}
            </ChartTooltip>
          ) : null}
        </div>
      </div>
      <div aria-hidden className="ml-16 flex text-[11px] text-muted">
        {columns.map((column) => (
          <span key={column.label} className="flex-1 truncate text-center">
            {column.label.slice(0, 3)}
          </span>
        ))}
      </div>
      <DataTable
        caption={label}
        head={['', valueLabel]}
        rows={columns.map((column) => [column.label, column.display])}
      />
    </figure>
  );
}
