import { Sparkline } from '@/components/charts/sparkline';
import type { IconComponent } from '@/components/ui/icons';
import { changeRatio } from '@/lib/chart-scale';

type KpiTileProps = {
  icon: IconComponent;
  label: string;
  value: string;
  current: number;
  previous: number;
  /** Names the comparison period, e.g. "өмнөх 30 хоногоос". */
  versus: string;
  /** 'up-good' colors a rise green and a fall red; 'neutral' keeps the delta gray. */
  polarity?: 'up-good' | 'neutral';
  trend: number[];
};

/** Stat tile: label · value · signed change vs the previous period · sparkline. */
export function KpiTile({
  icon: Icon,
  label,
  value,
  current,
  previous,
  versus,
  polarity = 'up-good',
  trend,
}: KpiTileProps) {
  const ratio = changeRatio(current, previous);
  const direction = ratio === null || ratio > 0 ? 'up' : ratio < 0 ? 'down' : 'flat';
  const tone =
    polarity === 'neutral' || direction === 'flat'
      ? 'text-muted'
      : direction === 'up'
        ? 'text-income'
        : 'text-expense';
  const delta =
    ratio === null
      ? 'Шинэ'
      : `${direction === 'up' ? '▲' : direction === 'down' ? '▼' : '•'} ${Math.abs(Math.round(ratio * 100))}%`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-text">
          <Icon className="size-4" />
        </span>
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p
          className={`min-w-0 font-semibold tracking-tight ${value.length > 11 ? 'text-xl' : 'text-2xl'}`}
        >
          {value}
        </p>
        <Sparkline values={trend} />
      </div>
      <p className="text-xs leading-relaxed">
        <span className={`font-semibold whitespace-nowrap ${tone}`}>{delta}</span>{' '}
        <span className="text-muted">{versus}</span>
      </p>
    </div>
  );
}

export function KpiTileSkeleton() {
  return <div aria-hidden className="h-[140px] animate-pulse rounded-2xl bg-surface-2" />;
}
