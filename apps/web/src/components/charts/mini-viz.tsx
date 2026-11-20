/*
 * Tiny decorative charts for stat cards. Each card's number and hint already say what the
 * chart shows, so these are aria-hidden; they add shape at a glance (trend, share, split).
 */

/** Rounded columns for the last days; the latest one in ink, the rest quiet. */
export function MiniBars({ values, count = 14 }: { values: number[]; count?: number }) {
  const shown = values.slice(-count);
  if (shown.length === 0) return null;
  const max = Math.max(1, ...shown);
  return (
    <div aria-hidden className="flex h-10 shrink-0 items-end gap-[3px]">
      {shown.map((value, index) => (
        <span
          key={index}
          className={`w-[5px] rounded-full ${index === shown.length - 1 ? 'bg-ink' : 'bg-muted/30'}`}
          style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

/** A small ring filled to `ratio` (0–1), the percentage in the middle. */
export function MiniRing({ ratio }: { ratio: number }) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const circumference = 2 * Math.PI * 18;
  return (
    <div aria-hidden className="relative size-12 shrink-0">
      <svg viewBox="0 0 48 48" className="size-full -rotate-90">
        <circle cx="24" cy="24" r="18" fill="none" strokeWidth="6" className="stroke-surface-2" />
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${clamped * circumference} ${circumference}`}
          className="stroke-chart-income"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums">
        {Math.round(clamped * 100)}%
      </span>
    </div>
  );
}

/** A soft area under a trend line, latest point marked. */
export function MiniArea({ values, count = 30 }: { values: number[]; count?: number }) {
  const shown = values.slice(-count);
  if (shown.length < 2) return null;
  const max = Math.max(1, ...shown);
  const span = shown.length - 1;
  const point = (value: number, index: number) => `${(index / span) * 100},${38 - (value / max) * 32}`;
  const line = shown.map((v, i) => `${i === 0 ? 'M' : 'L'}${point(v, i)}`).join(' ');
  const last = shown.at(-1) ?? 0;

  return (
    <div aria-hidden className="relative h-10 w-24 shrink-0">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="size-full overflow-visible">
        <path d={`${line} L100,40 L0,40 Z`} className="fill-chart-1/10" />
        <path d={line} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className="stroke-chart-1" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1 ring-2 ring-surface"
        style={{ top: `${((38 - (last / max) * 32) / 40) * 100}%` }}
      />
    </div>
  );
}

export type MeterPart = { label: string; value: number; text: string; className: string };

/** One bar split into parts against `total`, with a legend underneath. */
export function MiniMeter({ parts, total }: { parts: MeterPart[]; total: number }) {
  const base = Math.max(1, total, parts.reduce((sum, part) => sum + part.value, 0));
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-surface-2">
        {parts.map((part) => (
          <span key={part.label} className={`h-full rounded-full ${part.className}`} style={{ width: `${(part.value / base) * 100}%` }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-1.5">
            <span aria-hidden className={`size-2 rounded-full ${part.className}`} />
            {part.label} <span className="font-medium text-foreground tabular-nums">{part.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
