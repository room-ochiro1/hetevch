import { monthOf, monthRange, type MonthKey } from '@hetevch/shared';
import { useMemo, useState } from 'react';

import { openNewTransaction } from '@/components/finance/kind-options';
import { usePeriodMoves } from '@/components/finance/money-moves';
import { MonthSwitcher } from '@/components/finance/month-switcher';
import { TotalsSummary } from '@/components/finance/totals-summary';
import { TransactionsBody } from '@/components/finance/transactions-body';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';

/** A month of transactions and savings movements, with its totals on top. */
export default function TransactionsScreen() {
  const [month, setMonth] = useState<MonthKey>(() => monthOf(new Date()));
  const range = useMemo(() => monthRange(month), [month]);
  // The whole month is loaded anyway, so its totals are summed from it, not a second query.
  const { result, totals, saved } = usePeriodMoves(range);

  return (
    <Screen
      title="Гүйлгээ"
      action={
        <IconButton variant="accent" glyph="+" label="Гүйлгээ нэмэх" onPress={() => openNewTransaction()} />
      }>
      <MonthSwitcher month={month} onChange={setMonth} />
      <TotalsSummary totals={totals} saved={saved} />
      <TransactionsBody
        result={result}
        grouped
        emptyTitle="Энэ сард гүйлгээ алга"
        emptyActionLabel="+ Гүйлгээ нэмэх"
      />
    </Screen>
  );
}
