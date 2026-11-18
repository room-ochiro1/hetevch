import type { Totals } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

/** Income · Expense · Net for a period, side by side. Shows dashes until loaded. */
export function TotalsSummary({ totals }: { totals: Totals | null }) {
  const theme = useTheme();
  const money = useMoney();
  const columns: { label: string; value: string; tone: ThemeColor }[] = [
    { label: 'Орлого', value: totals ? `+${money.format(totals.income)}` : '—', tone: 'income' },
    { label: 'Зарлага', value: totals ? `−${money.format(totals.expense)}` : '—', tone: 'expense' },
    { label: 'Зөрүү', value: totals ? money.net(totals.net) : '—', tone: 'text' },
  ];

  return (
    <Card style={styles.card}>
      {columns.map((column, index) => (
        <View
          key={column.label}
          accessible
          accessibilityLabel={`${column.label}: ${column.value}`}
          style={[
            styles.column,
            index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
          ]}>
          <ThemedText type="caption" themeColor="textSecondary">
            {column.label}
          </ThemedText>
          <ThemedText
            type="smallBold"
            themeColor={column.tone}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.value}>
            {column.value}
          </ThemedText>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    gap: 0,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
