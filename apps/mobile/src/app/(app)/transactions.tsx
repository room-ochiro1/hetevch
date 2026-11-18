import { monthOf, monthRange, summarize, type MonthKey } from '@hetevch/shared';
import { useMemo, useState } from 'react';

import { openNewTransaction } from '@/components/finance/kind-options';
import { MonthSwitcher } from '@/components/finance/month-switcher';
import { TotalsSummary } from '@/components/finance/totals-summary';
import { TransactionsBody } from '@/components/finance/transactions-body';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { useTransactions } from '@/hooks/use-finance';

export default function TransactionsScreen() {
  const [month, setMonth] = useState<MonthKey>(() => monthOf(new Date()));
  const range = useMemo(() => monthRange(month), [month]);
  const transactions = useTransactions({ range });
  // The whole month is loaded anyway, so its totals are summed here instead of a second query.
  const totals = useMemo(
    () => (transactions.data ? summarize(transactions.data) : null),
    [transactions.data],
  );

  return (
    <Screen
      title="Гүйлгээ"
      action={
        <IconButton variant="accent" glyph="+" label="Гүйлгээ нэмэх" onPress={() => openNewTransaction()} />
      }>
      <MonthSwitcher month={month} onChange={setMonth} />
      <TotalsSummary totals={totals} />
      <TransactionsBody
        result={transactions}
        grouped
        emptyTitle="Энэ сард гүйлгээ алга"
        emptyActionLabel="+ Гүйлгээ нэмэх"
      />
    </Screen>
  );
}
