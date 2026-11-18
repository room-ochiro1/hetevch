import { periodRange, shiftPeriod, type SavingsMove } from '@hetevch/shared';
import { router } from 'expo-router';
import { useMemo } from 'react';

import { mergeMoves, type MoneyMove } from '@/components/finance/money-moves';
import type { StatementWindow } from '@/components/statement/open-statement';
import { changeTile } from '@/components/statement/statement-tiles';
import { StatementView } from '@/components/statement/statement-view';
import { cardColor } from '@/constants/savings-appearance';
import { useMoney } from '@/hooks/use-money';
import { useSavingsCard, useSavingsMoves } from '@/hooks/use-savings';
import type { QueryResult } from '@/hooks/use-supabase-query';
import { useTheme } from '@/hooks/use-theme';

/** Tögrög put in (positive movements) and taken out (negative, returned as positive). */
function flows(moves: readonly SavingsMove[]) {
  let added = 0;
  let taken = 0;
  for (const move of moves) {
    const base = move.base_amount ?? 0;
    if (base > 0) added += base;
    else taken -= base;
  }
  return { added, taken, net: added - taken };
}

type SavingsStatementProps = { window: StatementWindow; /** One card; all cards without it. */ cardId?: string };

/** Money moved into and out of one savings card (or all of them) in the period. */
export function SavingsStatement({ window, cardId }: SavingsStatementProps) {
  const money = useMoney();
  const theme = useTheme();
  const { period, anchor } = window;
  const range = useMemo(() => periodRange(period, anchor), [period, anchor]);
  const previousRange = useMemo(() => periodRange(period, shiftPeriod(period, anchor, -1)), [period, anchor]);
  const card = useSavingsCard(cardId).data;
  const currentAll = useSavingsMoves(range);
  const previousAll = useSavingsMoves(previousRange);
  const ofCard = (moves: SavingsMove[] | null) =>
    moves && cardId ? moves.filter((move) => move.card?.id === cardId) : moves;
  const current = { ...currentAll, data: ofCard(currentAll.data) };
  const previous = { ...previousAll, data: ofCard(previousAll.data) };

  const items: QueryResult<MoneyMove[]> = {
    ...current,
    data: current.data ? mergeMoves([], current.data) : null,
  };
  const now = current.data ? flows(current.data) : null;
  const before = previous.data ? flows(previous.data).net : null;

  return (
    <StatementView
      icon={card?.icon ?? '🐷'}
      iconColor={card ? cardColor(card.color) : theme.text}
      title={card?.name ?? 'Хадгаламж'}
      totalText={now === null ? '—' : money.format(Math.abs(now.net))}
      totalTone="text"
      caption={now === null ? null : now.net >= 0 ? 'Цэвэр хадгалсан · зарлагад тооцогдохгүй' : 'Цэвэр авсан'}
      tiles={[
        { label: 'Хийсэн', value: now ? `+${money.format(now.added)}` : '—' },
        { label: 'Авсан', value: now ? `−${money.format(now.taken)}` : '—' },
        changeTile(period, now?.net ?? null, before, true),
      ]}
      items={items}
      emptyTitle="Энэ хугацаанд хадгаламжийн хөдөлгөөн алга"
      addLabel={card ? '+ Карт руу мөнгө хийх' : 'Хадгаламжийн картууд'}
      onAdd={() =>
        cardId
          ? router.push({ pathname: '/savings/entry', params: { accountId: cardId, type: 'in' } })
          : router.push('/savings')
      }
    />
  );
}
