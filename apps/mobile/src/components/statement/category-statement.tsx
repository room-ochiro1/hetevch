import { KIND_LABELS, periodRange, shiftPeriod, type TransactionKind } from '@hetevch/shared';
import { useMemo } from 'react';

import { openNewTransaction } from '@/components/finance/kind-options';
import { mergeMoves, type MoneyMove } from '@/components/finance/money-moves';
import type { StatementWindow } from '@/components/statement/open-statement';
import { changeTile } from '@/components/statement/statement-tiles';
import { StatementView } from '@/components/statement/statement-view';
import { StateMessage } from '@/components/ui/state-message';
import { useCategories, useTotals, useTransactions } from '@/hooks/use-finance';
import { useMoney } from '@/hooks/use-money';
import type { QueryResult } from '@/hooks/use-supabase-query';

/** Genitive forms for "Нийт зарлагын 12%" / "Нийт орлогын 40%". */
const OF_KIND: Record<TransactionKind, string> = { expense: 'зарлагын', income: 'орлогын' };

const sum = (rows: readonly { amount: number }[] | null) =>
  rows ? rows.reduce((total, row) => total + row.amount, 0) : null;

/** One category's statement: total, count, average, change and share, then its transactions. */
export function CategoryStatement({ categoryId, window }: { categoryId: string; window: StatementWindow }) {
  const money = useMoney();
  const { period, anchor } = window;
  const range = useMemo(() => periodRange(period, anchor), [period, anchor]);
  const previousRange = useMemo(() => periodRange(period, shiftPeriod(period, anchor, -1)), [period, anchor]);
  const categories = useCategories();
  const current = useTransactions({ range, categoryId });
  const previous = useTransactions({ range: previousRange, categoryId });
  const totals = useTotals(range);

  const category = categories.data?.find((item) => item.id === categoryId);
  const items = useMemo<QueryResult<MoneyMove[]>>(
    () => ({ ...current, data: current.data ? mergeMoves(current.data, []) : null }),
    [current],
  );

  if (categories.error) {
    return <StateMessage tone="error" icon="⚠️" title="Ангиллыг ачаалж чадсангүй" body={categories.error} />;
  }
  if (!category) {
    return categories.data ? <StateMessage icon="🔍" title="Ангилал олдсонгүй" /> : null;
  }

  const kind = category.kind;
  const total = sum(current.data);
  const count = current.data?.length ?? null;
  const kindTotal = totals.data ? totals.data[kind] : null;
  const share = total !== null && kindTotal ? Math.round((total / kindTotal) * 100) : null;

  return (
    <StatementView
      icon={category.icon}
      iconColor={category.color}
      title={category.name}
      totalText={total === null ? '—' : `${kind === 'income' ? '+' : '−'}${money.format(total)}`}
      totalTone={kind === 'income' ? 'income' : 'text'}
      caption={share === null ? KIND_LABELS[kind] : `Нийт ${OF_KIND[kind]} ${share}%`}
      tiles={[
        { label: 'Гүйлгээ', value: count === null ? '—' : String(count) },
        {
          label: 'Дундаж',
          value: total !== null && count ? money.format(total / count) : '—',
        },
        changeTile(period, total, sum(previous.data), kind === 'income'),
      ]}
      items={items}
      emptyTitle="Энэ хугацаанд гүйлгээ алга"
      addLabel={`+ ${category.name} нэмэх`}
      onAdd={() => openNewTransaction({ kind, categoryId })}
    />
  );
}
