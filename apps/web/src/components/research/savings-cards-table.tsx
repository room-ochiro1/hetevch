import { formatAmount } from '@hetevch/shared';
import Link from 'next/link';

import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { AGE_BAND_LABELS } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import { formatCount, formatShortDay } from '@/lib/format';
import type { Filters } from '@/lib/filters';

const SHOWN = 50;

/** Every user's savings cards, newest first, linking to the owner's page. */
export async function SavingsCardsTable({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const { cards } = await getResearch(days, band, sex);
  const shown = cards.slice(0, SHOWN);

  return (
    <Panel
      title="Хэрэглэгчдийн хадгаламжийн картууд"
      description={`${formatCount(cards.length)} карт${cards.length > SHOWN ? ` · сүүлийн ${SHOWN}-г харуулж байна` : ''} · дүн нь хүүгүйгээр (хийсэн − авсан)`}
      flush
    >
      {shown.length === 0 ? (
        <EmptyState title="Хадгаламжийн карт алга" hint="Хэрэглэгчид аппаас карт үүсгэхэд энд гарна." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Хэрэглэгчдийн хадгаламжийн картууд</caption>
            <thead>
              <tr className="border-y border-border bg-surface-2/50 text-left text-xs text-muted">
                <th scope="col" className="px-5 py-2 font-medium">Карт</th>
                <th scope="col" className="px-3 py-2 font-medium">Эзэмшигч</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Хадгалсан</th>
                <th scope="col" className="px-3 py-2 font-medium">Зорилго</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Хүү</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">Сүүлийн хөдөлгөөн</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((card) => {
                const progress = card.goal ? Math.min(1, Math.max(0, card.deposited / card.goal)) : null;
                return (
                  <tr key={card.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-5 py-3 text-left font-medium">
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{card.icon}</span>
                        <span className="truncate">{card.name}</span>
                      </span>
                    </th>
                    <td className="px-3 py-3">
                      <Link href={`/users/${card.userId}`} className="font-medium hover:underline">
                        {card.owner}
                      </Link>
                      <span className="block text-xs text-muted">{AGE_BAND_LABELS[card.band]}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">
                      {formatAmount(card.currency === 'MNT' ? Math.round(card.deposited) : card.deposited, card.currency)}
                    </td>
                    <td className="px-3 py-3">
                      {progress === null || card.goal === null ? (
                        <span className="text-xs text-muted">Тавиагүй</span>
                      ) : (
                        <span className="flex min-w-32 flex-col gap-1">
                          <span className="h-1.5 rounded-full bg-surface-2">
                            <span className="block h-full rounded-full bg-chart-1" style={{ width: `${progress * 100}%` }} />
                          </span>
                          <span className="text-xs text-muted tabular-nums">
                            {Math.round(progress * 100)}% · {formatAmount(card.goal, card.currency)}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{card.rate > 0 ? `${Number(card.rate.toFixed(2))}%` : '—'}</td>
                    <td className="px-5 py-3 text-right text-xs text-muted">
                      {card.lastMovedOn ? formatShortDay(card.lastMovedOn) : 'Хөдөлгөөнгүй'}
                      <span className="block">{formatCount(card.entries)} бичлэг</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
