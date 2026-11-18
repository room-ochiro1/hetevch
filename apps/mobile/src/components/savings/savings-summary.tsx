import { INTEREST_TAX_RATE, afterTax, formatMoney, type SavingsSummary } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const money = (value: number) => formatMoney(Math.round(value));

/** Total across all accounts, then what they earn per day, month and year. */
export function SavingsSummaryCard({ summary }: { summary: SavingsSummary }) {
  const theme = useTheme();
  const periods = [
    { label: 'Өдөрт', value: summary.perDay },
    { label: 'Сард', value: summary.perMonth },
    { label: 'Жилд', value: summary.perYear },
  ];

  return (
    <Card tone="lavender" style={styles.card}>
      <ThemedText type="small" themeColor="lavenderInk">
        Нийт хадгаламж · {summary.count} данс
      </ThemedText>
      <ThemedText type="display" numberOfLines={1} adjustsFontSizeToFit>
        {money(summary.balance)}
      </ThemedText>
      <ThemedText type="small" themeColor="income">
        Үүнээс хуримтлагдсан хүү +{money(summary.accrued)}
      </ThemedText>

      <View style={styles.periods}>
        {periods.map((period) => (
          <View key={period.label} style={[styles.period, { backgroundColor: theme.background }]}>
            <ThemedText type="caption" themeColor="textSecondary">
              {period.label}
            </ThemedText>
            <ThemedText type="smallBold" numberOfLines={1} adjustsFontSizeToFit>
              +{money(period.value)}
            </ThemedText>
          </View>
        ))}
      </View>
      <ThemedText type="caption" themeColor="textSecondary">
        Татварын өмнөх хүү. {INTEREST_TAX_RATE * 100}% хүүгийн татварын дараа сард ~
        {money(afterTax(summary.perMonth))}.
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  periods: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  period: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.half,
  },
});
