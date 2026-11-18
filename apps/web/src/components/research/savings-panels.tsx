import { formatAmount, formatMoney } from '@hetevch/shared';

import { Legend } from '@/components/charts/chart-parts';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { SAVINGS_PURPOSES } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import { formatCount, formatShortDay } from '@/lib/format';
import type { RangeDays } from '@/lib/range';

const money = (value: number) => formatMoney(Math.round(value));

/** Money moving in and out of savings each week, and what people are saving for. */
export async function SavingsPanels({ days }: { days: RangeDays }) {
  const { flow, cards } = await getResearch(days);
  const weeks = flow.filter((row) => row.currency === 'MNT').sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const usdIn = flow.filter((row) => row.currency === 'USD').reduce((sum, row) => sum + row.deposits, 0);
  const max = Math.max(1, ...weeks.flatMap((week) => [week.deposits, week.withdrawals]));

  const purposes = new Map<string, { count: number; mnt: number; usd: number; goals: number[] }>();
  for (const card of cards) {
    const entry = purposes.get(card.icon) ?? { count: 0, mnt: 0, usd: 0, goals: [] };
    entry.count += 1;
    if (card.currency === 'MNT') entry.mnt += card.deposited;
    else entry.usd += card.deposited;
    if (card.goal) entry.goals.push(Math.min(1, card.deposited / card.goal));
    purposes.set(card.icon, entry);
  }
  const ranked = [...purposes.entries()].sort((a, b) => b[1].count - a[1].count || b[1].mnt - a[1].mnt);
  const maxCount = Math.max(1, ...ranked.map(([, p]) => p.count));

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Panel title="Хадгаламжийн урсгал" description={`7 хоног бүр картад хийсэн ба авсан мөнгө (₮) · сүүлийн ${days} хоног`}>
        {weeks.length === 0 ? (
          <EmptyState title="Энэ хугацаанд хадгаламжийн хөдөлгөөн алга" hint="Хэрэглэгчид картдаа мөнгө хийх, авахад энд гарна." />
        ) : (
          <div className="flex flex-col gap-4">
            <Legend items={[{ label: 'Хийсэн', swatch: 'bg-chart-income' }, { label: 'Авсан', swatch: 'bg-chart-expense' }]} />
            <ol className="flex flex-col gap-3">
              {weeks.map((week) => (
                <li key={week.weekStart} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-xs">
                  <span className="text-muted" title="7 хоногийн эхний өдөр (Даваа)">
                    {formatShortDay(week.weekStart)}
                  </span>
                  <span className="flex flex-col gap-1">
                    <Bar value={week.deposits} max={max} className="bg-chart-income" text={`+${money(week.deposits)}`} />
                    <Bar value={week.withdrawals} max={max} className="bg-chart-expense" text={`−${money(week.withdrawals)}`} />
                  </span>
                </li>
              ))}
            </ol>
            {usdIn > 0 ? (
              <p className="text-xs text-muted">Долларын картуудад мөн {formatAmount(usdIn, 'USD')} хийсэн.</p>
            ) : null}
          </div>
        )}
      </Panel>

      <Panel title="Юуны төлөө хуримтлуулж байна?" description="Картын зорилгоор (хэрэглэгчийн сонгосон дүрсээр)">
        {ranked.length === 0 ? (
          <EmptyState title="Хадгаламжийн карт алга" hint="Хэрэглэгчид карт үүсгэхэд зорилгоороо энд бүлэглэгдэнэ." />
        ) : (
          <ol className="flex flex-col gap-4">
            {ranked.map(([icon, purpose]) => {
              const progress = purpose.goals.length
                ? Math.round((purpose.goals.reduce((s, g) => s + g, 0) / purpose.goals.length) * 100)
                : null;
              return (
                <li key={icon} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden>{icon}</span>
                      <span className="truncate font-medium">{SAVINGS_PURPOSES[icon] ?? 'Бусад'}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatCount(purpose.count)} карт</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${(purpose.count / maxCount) * 100}%` }} />
                  </div>
                  <p className="text-xs text-muted tabular-nums">
                    {money(purpose.mnt)}
                    {purpose.usd > 0 ? ` + ${formatAmount(purpose.usd, 'USD')}` : ''}
                    {progress !== null ? ` · зорилгынхоо дунджаар ${progress}%-д` : ' · зорилго тавиагүй'}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}

function Bar({ value, max, className, text }: { value: number; max: number; className: string; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2.5 flex-1 rounded-full bg-surface-2">
        <span
          className={`block h-full rounded-full ${className}`}
          style={{ width: `${value > 0 ? Math.max(2, (value / max) * 100) : 0}%` }}
        />
      </span>
      <span className="w-24 shrink-0 text-right tabular-nums">{text}</span>
    </span>
  );
}
