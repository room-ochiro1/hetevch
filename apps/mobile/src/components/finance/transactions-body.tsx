import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { openNewTransaction } from '@/components/finance/kind-options';
import type { MoneyMove } from '@/components/finance/money-moves';
import { TransactionList } from '@/components/finance/transaction-list';
import { Button } from '@/components/ui/button';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { QueryResult } from '@/hooks/use-supabase-query';

type TransactionsBodyProps = {
  result: QueryResult<MoneyMove[]>;
  grouped?: boolean;
  emptyTitle: string;
  emptyBody?: string;
  /** Label of the big add button shown when there's nothing yet. */
  emptyActionLabel?: string;
};

/** The list's loading, error, empty and list states in one place. */
export function TransactionsBody({
  result,
  grouped,
  emptyTitle,
  emptyBody,
  emptyActionLabel,
}: TransactionsBodyProps) {
  const theme = useTheme();

  if (result.error) {
    return (
      <StateMessage
        tone="error"
        icon="⚠️"
        title="Гүйлгээг ачаалж чадсангүй"
        body="Интернэт холболтоо шалгаад доош татаж дахин оролдоно уу."
      />
    );
  }
  if (!result.data) {
    return <ActivityIndicator color={theme.accent} style={styles.spinner} />;
  }
  if (result.data.length === 0) {
    return (
      <View style={styles.empty}>
        <StateMessage icon="🧾" title={emptyTitle} body={emptyBody} />
        {emptyActionLabel ? <Button title={emptyActionLabel} onPress={() => openNewTransaction()} /> : null}
      </View>
    );
  }
  return <TransactionList items={result.data} grouped={grouped} />;
}

const styles = StyleSheet.create({
  spinner: {
    paddingVertical: Spacing.five,
  },
  empty: {
    gap: Spacing.two,
  },
});
