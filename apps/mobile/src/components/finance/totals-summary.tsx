import type { Totals } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

type TotalsSummaryProps = {
  totals: Totals | null;
  /** Net tögrög moved into savings in the period (negative if more came out). */
  saved?: number | null;
};

/**
 * Income · Expense · [Savings] · Net for a period, side by side; dashes until loaded. Savings
 * get a column only when money moved; the net then is what is left in hand, like the balance.
 */
export function TotalsSummary({ totals, saved = null }: TotalsSummaryProps) {
  const theme = useTheme();
  const money = useMoney();
  const moved = saved ?? 0;
  const columns: { label: string; value: string; tone: ThemeColor }[] = [
    { label: 'Орлого', value: totals ? `+${money.format(totals.income)}` : '—', tone: 'income' },
    { label: 'Зарлага', value: totals ? `−${money.format(totals.expense)}` : '—', tone: 'expense' },
    ...(moved !== 0
      ? [{ label: 'Хадгаламж', value: money.net(-moved), tone: 'text' as const }]
      : []),
    { label: 'Зөрүү', value: totals ? money.net(totals.net - moved) : '—', tone: 'text' },
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
