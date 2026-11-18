'use client';

import { useState, type KeyboardEvent } from 'react';

import { DataTable } from '@/components/charts/chart-parts';

export type MatrixRow = { key: string; label: string; /** Small line under the label. */ note?: string };
export type MatrixCol = { key: string; label: string };

type MatrixHeatmapProps = {
  rows: MatrixRow[];
  cols: MatrixCol[];
  /** 0–1 per cell (rows × cols); each row is one group's split, so rows compare fairly. */
  shares: number[][];
  /** Readout per cell, e.g. "25–34 нас · Хоол: 120,000 ₮ (34%)". */
  details: string[][];
  label: string;
  /** Widths in rem: narrow columns let a 7-day grid fit a half-width panel. */
  labelWidth?: number;
  colWidth?: number;
};

/**
 * Tints stay light (one hue, at most 42% into the surface) so the printed percentage keeps
 * full text contrast in both themes; the number carries the value, the tint the pattern.
 */
const STEPS = [10, 18, 26, 34, 42];

function tint(share: number, max: number): string {
  if (share <= 0) return 'var(--surface-2)';
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((share / max) * STEPS.length))] ?? 42;
  return `color-mix(in oklab, var(--chart-1) ${step}%, var(--surface))`;
}

const percent = (share: number) => (share > 0 ? `${Math.round(share * 100)}%` : '—');

/** Group × item grid of shares with a hover/keyboard readout and a screen-reader table. */
export function MatrixHeatmap({
  rows,
  cols,
  shares,
  details,
  label,
  labelWidth = 8.5,
  colWidth = 4.25,
}: MatrixHeatmapProps) {
  const [active, setActive] = useState<{ row: number; col: number } | null>(null);
  const max = Math.max(0.0001, ...shares.flat());
  const readout = active
    ? (details[active.row]?.[active.col] ?? '')
    : 'Нүдэн дээр очиход дүн нь гарна. Мөр бүр 100% болно.';

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setActive((current) => {
      const from = current ?? { row: 0, col: 0 };
      return {
        row: Math.min(rows.length - 1, Math.max(0, from.row + move[0])),
        col: Math.min(cols.length - 1, Math.max(0, from.col + move[1])),
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
          onFocus={() => setActive((current) => current ?? { row: 0, col: 0 })}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
          className="grid gap-1 rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          style={{
            gridTemplateColumns: `${labelWidth}rem repeat(${cols.length}, minmax(${colWidth}rem, 1fr))`,
            minWidth: `${labelWidth + cols.length * (colWidth + 0.25)}rem`,
          }}
        >
          <span />
          {cols.map((col) => (
            <span key={col.key} aria-hidden className="truncate px-1 text-center text-[11px] text-muted" title={col.label}>
              {col.label}
            </span>
          ))}
          {rows.map((row, r) => [
            <span key={`label-${row.key}`} aria-hidden className="flex flex-col justify-center pr-2 text-xs">
              <span className="truncate font-medium">{row.label}</span>
              {row.note ? <span className="truncate text-[10px] text-muted">{row.note}</span> : null}
            </span>,
            ...cols.map((col, c) => {
              const share = shares[r]?.[c] ?? 0;
              const selected = active?.row === r && active.col === c;
              return (
                <span
                  key={`${row.key}-${col.key}`}
                  aria-hidden
                  onMouseEnter={() => setActive({ row: r, col: c })}
                  className={`flex h-10 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                    share > 0 ? 'text-foreground' : 'text-muted'
                  } ${selected ? 'ring-2 ring-foreground ring-offset-1 ring-offset-surface' : ''}`}
                  style={{ background: tint(share, max) }}
                >
                  {percent(share)}
                </span>
              );
            }),
          ])}
        </div>
      </div>
      <DataTable
        caption={label}
        head={['Бүлэг', ...cols.map((col) => col.label)]}
        rows={rows.map((row, r) => [row.label, ...cols.map((_, c) => percent(shares[r]?.[c] ?? 0))])}
      />
    </figure>
  );
}
