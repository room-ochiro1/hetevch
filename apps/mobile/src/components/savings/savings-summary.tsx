import { INTEREST_TAX_RATE, type ByCurrency, type SavingsSummary } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

const hasAny = (parts: ByCurrency) => Object.values(parts).some((value) => value);

/** All cards together, in the display currency, then what they earn per day, month and year. */
export function SavingsSummaryCard({ summary }: { summary: SavingsSummary }) {
  const theme = useTheme();
  const money = useMoney();
  const earns = hasAny(summary.perMonth);
  const periods = [
    { label: 'Өдөрт', value: summary.perDay },
    { label: 'Сард', value: summary.perMonth },
    { label: 'Жилд', value: summary.perYear },
  ];

  return (
    <Card tone="lavender" style={styles.card}>
      <ThemedText type="small" themeColor="lavenderInk">
        Нийт хадгаламж · {summary.count} карт
      </ThemedText>
      <ThemedText type="display" numberOfLines={1} adjustsFontSizeToFit>
        {money.combine(summary.balance)}
      </ThemedText>
      {hasAny(summary.accrued) ? (
        <ThemedText type="small" themeColor="income">
          Үүнээс хүү +{money.combine(summary.accrued)}
        </ThemedText>
      ) : null}

      {earns ? (
        <>
          <View style={styles.periods}>
            {periods.map((period) => (
              <View key={period.label} style={[styles.period, { backgroundColor: theme.background }]}>
                <ThemedText type="caption" themeColor="textSecondary">
                  {period.label}
                </ThemedText>
                <ThemedText type="smallBold" numberOfLines={1} adjustsFontSizeToFit>
                  +{money.combine(period.value)}
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            Татварын өмнөх хүү ({INTEREST_TAX_RATE * 100}% хүүгийн татвар ногдож болно).
          </ThemedText>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.four, gap: Spacing.two },
  periods: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  period: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.half,
  },
});
