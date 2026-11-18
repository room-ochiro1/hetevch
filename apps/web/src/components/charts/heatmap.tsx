'use client';

import { useState, type KeyboardEvent } from 'react';

import { DataTable } from '@/components/charts/chart-parts';
import { formatCount } from '@/lib/format';

export type HeatCell = { weekday: number; hour: number; count: number };

/** ISO weekdays, Monday first (1 = Monday … 7 = Sunday). */
const WEEKDAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
/** Mix of the accent into the surface per bin; the first step stays clearly off "empty". */
const STEPS = [30, 47, 64, 82, 100];

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** Sequential, one hue: an empty cell is the neutral surface, more activity is darker. */
function cellColor(count: number, max: number): string {
  if (count === 0) return 'var(--surface-2)';
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((count / max) * STEPS.length))] ?? 100;
  return `color-mix(in oklab, var(--chart-1) ${step}%, var(--surface))`;
}

/** Weekday × hour grid of when transactions are logged (Ulaanbaatar time). */
export function Heatmap({ cells, label }: { cells: HeatCell[]; label: string }) {
  const grid = WEEKDAYS.map((_, row) =>
    HOURS.map((hour) => cells.find((c) => c.weekday === row + 1 && c.hour === hour)?.count ?? 0),
  );
  const max = Math.max(1, ...grid.flat());
  const [active, setActive] = useState<{ row: number; hour: number } | null>(null);
  const readout = active
    ? `${WEEKDAYS[active.row]} ${hourLabel(active.hour)}–${hourLabel((active.hour + 1) % 24)} · ${formatCount(grid[active.row]?.[active.hour] ?? 0)} гүйлгээ`
    : 'Нүдэн дээр очиход тухайн цагийн гүйлгээний тоо гарна.';

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setActive((current) => {
      const from = current ?? { row: 0, hour: 0 };
      return {
        row: Math.min(6, Math.max(0, from.row + move[0])),
        hour: Math.min(23, Math.max(0, from.hour + move[1])),
      };
    });
  }

  return (
    <figure className="flex flex-col gap-3">
      <p className="min-h-4 text-xs text-muted" aria-live="polite">
        {readout}
      </p>
      <div className="overflow-x-auto">
        <div
          tabIndex={0}
          role="img"
          aria-label={`${label}. Сум товчоор нүд сонгоно.`}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((current) => current ?? { row: 0, hour: 0 })}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
          className="grid min-w-[560px] grid-cols-[3.5rem_repeat(24,minmax(0,1fr))] gap-[2px] rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span />
          {HOURS.map((hour) => (
            <span key={hour} aria-hidden className="text-center text-[10px] text-muted tabular-nums">
              {hour % 3 === 0 ? hour : ''}
            </span>
          ))}
          {grid.map((row, rowIndex) => [
            <span key={`label-${rowIndex}`} aria-hidden className="pr-2 text-right text-[11px] leading-6 text-muted">
              {WEEKDAYS[rowIndex]?.slice(0, 2)}
            </span>,
            ...row.map((count, hour) => {
              const selected = active?.row === rowIndex && active.hour === hour;
              return (
                <span
                  key={`${rowIndex}-${hour}`}
                  aria-hidden
                  onMouseEnter={() => setActive({ row: rowIndex, hour })}
                  className={`h-6 rounded-[3px] ${selected ? 'ring-2 ring-foreground ring-offset-1 ring-offset-surface' : ''}`}
                  style={{ background: cellColor(count, max) }}
                />
              );
            }),
          ])}
        </div>
      </div>
      <div aria-hidden className="flex items-center justify-end gap-1.5 text-[11px] text-muted">
        Бага
        {[0, ...STEPS].map((step) => (
          <span
            key={step}
            className="size-3 rounded-[3px]"
            style={{ background: step === 0 ? 'var(--surface-2)' : `color-mix(in oklab, var(--chart-1) ${step}%, var(--surface))` }}
          />
        ))}
        Их
      </div>
      <DataTable
        caption={label}
        head={['Гараг', ...HOURS.map(hourLabel)]}
        rows={grid.map((row, i) => [WEEKDAYS[i] ?? '', ...row.map((n) => formatCount(n))])}
      />
    </figure>
  );
}
