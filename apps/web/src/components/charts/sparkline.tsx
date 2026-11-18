/**
 * Tiny trend line for a stat tile: the series in the de-emphasis gray, the latest point in
 * the accent. Decorative: the tile's value and delta already say what it shows.
 */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const span = values.length - 1;
  const y = (value: number) => 90 - (value / max) * 80;
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / span) * 100},${y(v)}`).join(' ');
  const last = values.at(-1) ?? 0;

  return (
    <div aria-hidden className="relative mb-1 h-7 w-16 shrink-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full overflow-visible">
        <path
          d={path}
          fill="none"
          className="stroke-muted/60"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className="absolute right-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1 ring-2 ring-surface"
        style={{ top: `${y(last)}%` }}
      />
    </div>
  );
}
