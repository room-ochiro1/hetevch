'use client';

import { formatMoney, formatNet } from '@hetevch/shared';

import { ChartTooltip, DataTable, Legend, TooltipRow, YTicks } from '@/components/charts/chart-parts';
import { useChartCursor } from '@/components/charts/use-chart-cursor';
import { formatTick, niceMax } from '@/lib/chart-scale';
import { formatShortDay } from '@/lib/format';

export type CashflowPoint = { day: string; income: number; expense: number };

/** One money scale for both sides; the baseline sits where it splits the height by value. */
function scale(data: CashflowPoint[]) {
  const maxIncome = Math.max(0, ...data.map((d) => d.income));
  const maxExpense = Math.max(0, ...data.map((d) => d.expense));
  const up = maxIncome > 0 ? niceMax(maxIncome) : maxExpense > 0 ? 0 : 1;
  const down = maxExpense > 0 ? niceMax(maxExpense) : maxIncome > 0 ? 0 : 1;
  const total = up + down;
  return { up, down, total, base: (up / total) * 100 };
}

/**
 * Daily money flow: income rises above the baseline, expense hangs below it, both on the
 * same scale (one unit = the same height on either side). Position carries the sign as well
 * as color, so it reads without color vision.
 */
export function CashflowChart({ data, label }: { data: CashflowPoint[]; label: string }) {
  const { active, setActive, plotProps } = useChartCursor(data.length);
  const { up, down, total, base } = scale(data);
  const ticks = [
    { label: formatTick(up), at: 0 },
    { label: '0', at: base },
    { label: formatTick(-down), at: 100 },
  ].filter((tick, i) => i === 1 || (tick.at !== base && Math.abs(tick.at - base) >= 10));
  const point = active === null ? null : data[active];
  const middle = data[Math.floor((data.length - 1) / 2)];

  return (
    <figure className="flex flex-col gap-4">
      <Legend
        items={[
          { label: 'Орлого', swatch: 'bg-chart-income' },
          { label: 'Зарлага', swatch: 'bg-chart-expense' },
        ]}
      />
      <div className="flex pt-2">
        <YTicks ticks={ticks} />
        <div
          {...plotProps}
          role="img"
          aria-label={`${label}. Сум товчоор өдөр сонгоно.`}
          className="relative h-60 flex-1 rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 border-t border-border" />
          <div aria-hidden className="absolute inset-x-0 border-t border-muted/40" style={{ top: `${base}%` }} />
          <div aria-hidden className="absolute inset-x-0 bottom-0 border-t border-border" />

          <div className="absolute inset-0 flex">
            {data.map((d, index) => {
              const dim = active !== null && active !== index ? 'opacity-40' : '';
              return (
                <div
                  key={d.day}
                  className="relative h-full flex-1"
                  onMouseEnter={() => setActive(index)}
                >
                  {active === index ? (
                    <div aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-border" />
                  ) : null}
                  <span
                    className={`absolute left-1/2 w-[70%] max-w-6 -translate-x-1/2 rounded-t-[4px] bg-chart-income transition-opacity ${dim}`}
                    style={{ bottom: `${100 - base}%`, height: `${(d.income / total) * 100}%` }}
                  />
                  <span
                    className={`absolute left-1/2 w-[70%] max-w-6 -translate-x-1/2 rounded-b-[4px] bg-chart-expense transition-opacity ${dim}`}
                    style={{ top: `${base}%`, height: `${(d.expense / total) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>

          {point && active !== null ? (
            <ChartTooltip position={(active + 0.5) / data.length}>
              <p className="mb-1 text-muted">{formatShortDay(point.day)}</p>
              <TooltipRow swatch="bg-chart-income" label="орлого" value={`+${formatMoney(point.income)}`} />
              <TooltipRow swatch="bg-chart-expense" label="зарлага" value={`−${formatMoney(point.expense)}`} />
              <div className="mt-1 border-t border-border pt-1">
                <TooltipRow label="зөрүү" value={formatNet(point.income - point.expense)} />
              </div>
            </ChartTooltip>
          ) : null}
        </div>
      </div>
      <div aria-hidden className="ml-16 flex justify-between text-[11px] text-muted">
        <span>{data[0] ? formatShortDay(data[0].day) : ''}</span>
        <span>{middle && data.length > 2 ? formatShortDay(middle.day) : ''}</span>
        <span>{data.at(-1) ? formatShortDay(data.at(-1)?.day ?? '') : ''}</span>
      </div>
      <DataTable
        caption={label}
        head={['Өдөр', 'Орлого', 'Зарлага']}
        rows={data.map((d) => [formatShortDay(d.day), formatMoney(d.income), formatMoney(d.expense)])}
      />
    </figure>
  );
}
