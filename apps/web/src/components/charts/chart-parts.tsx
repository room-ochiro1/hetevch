import type { ReactNode } from 'react';

/** Legend for ≥ 2 series: a swatch shaped like the mark, then the name in text color. */
export function Legend({ items }: { items: { label: string; swatch: string; shape?: 'bar' | 'line' }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={`${item.shape === 'line' ? 'h-0.5 w-3.5' : 'size-2.5'} rounded-[2px] ${item.swatch}`}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Floating readout above the plot, kept inside it near the edges. */
export function ChartTooltip({ position, children }: { position: number; children: ReactNode }) {
  const align =
    position < 0.15 ? 'translate-x-0' : position > 0.85 ? '-translate-x-full' : '-translate-x-1/2';

  return (
    <div
      className={`pointer-events-none absolute -top-2 z-20 min-w-40 -translate-y-full rounded-2xl bg-surface px-3 py-2 text-xs shadow-pop ring-1 ring-border ${align}`}
      style={{ left: `${position * 100}%` }}
    >
      {children}
    </div>
  );
}

/** One tooltip row: value first (it's what the reader wants), series name after it. */
export function TooltipRow({ swatch, label, value }: { swatch?: string; label: string; value: string }) {
  return (
    <p className="flex items-center gap-2 whitespace-nowrap">
      {swatch ? <span aria-hidden className={`h-0.5 w-3 rounded ${swatch}`} /> : null}
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-muted">{label}</span>
    </p>
  );
}

/** Y-axis tick labels beside the plot; `at` is the tick's position from the top, in %. */
export function YTicks({ ticks }: { ticks: { label: string; at: number }[] }) {
  return (
    <div aria-hidden className="relative w-16 shrink-0 text-right text-[11px] leading-none whitespace-nowrap tabular-nums text-muted">
      {ticks.map((tick) => (
        <span
          key={`${tick.label}-${tick.at}`}
          className="absolute right-2 -translate-y-1/2"
          style={{ top: `${tick.at}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

/** Screen-reader (and copy-paste) twin of a chart: every value as a table. */
export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {head.map((cell) => (
            <th key={cell} scope="col">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, index) =>
              index === 0 ? (
                <th key={index} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={index}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
