import {
  formatDayLabel,
  groupByDay,
  type TransactionListItem,
} from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { TransactionRow } from '@/components/finance/transaction-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';

type TransactionListProps = {
  items: readonly TransactionListItem[];
  /** Group under day headers with each day's net; otherwise one flat list with dates. */
  grouped?: boolean;
};

export function TransactionList({ items, grouped = false }: TransactionListProps) {
  const money = useMoney();

  if (!grouped) {
    return <Rows items={items} showDate />;
  }

  return (
    <View style={styles.groups}>
      {groupByDay(items).map((group) => (
        <View key={group.day} style={styles.group}>
          <View style={styles.dayHeader}>
            <ThemedText type="caption" themeColor="textSecondary">
              {formatDayLabel(group.day)}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary" style={styles.tabular}>
              {money.net(group.net)}
            </ThemedText>
          </View>
          <Rows items={group.items} />
        </View>
      ))}
    </View>
  );
}

function Rows({ items, showDate }: { items: readonly TransactionListItem[]; showDate?: boolean }) {
  return (
    <View style={styles.rows}>
      {items.map((item) => (
        <TransactionRow key={item.id} item={item} showDate={showDate} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  rows: {
    gap: Spacing.two + Spacing.half,
  },
});
