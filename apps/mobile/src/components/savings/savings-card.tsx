import {
  COMPOUNDING_LABELS,
  depositStatus,
  formatLongDate,
  formatMoney,
  formatRate,
  interestPer,
  toISODate,
  toTrackedDeposit,
  type SavingsAccount,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const money = (value: number) => formatMoney(Math.round(value));

/** One deposit: balance with interest so far, its rate, and how far through its term it is. */
export function SavingsCard({ account }: { account: SavingsAccount }) {
  const theme = useTheme();
  const deposit = toTrackedDeposit(account);
  const status = depositStatus(deposit, toISODate(new Date()));
  const perMonth = interestPer(deposit).month;
  const matured = status.daysLeft === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Засах"
      onPress={() => router.push({ pathname: '/savings/edit', params: { id: account.id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.surface },
      ]}>
      <View style={styles.top}>
        <View style={[styles.tile, { backgroundColor: theme.lavender }]}>
          <Text style={styles.tileGlyph}>🏦</Text>
        </View>
        <View style={styles.titles}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {account.name}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {[account.bank, COMPOUNDING_LABELS[account.compounding]].filter(Boolean).join(' · ')}
          </ThemedText>
        </View>
        <View style={[styles.rate, { backgroundColor: theme.mint }]}>
          <ThemedText type="caption" themeColor="mintInk">
            {formatRate(deposit.annualRate)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.amounts}>
        <ThemedText type="heading" numberOfLines={1} adjustsFontSizeToFit style={styles.balance}>
          {money(status.balance)}
        </ThemedText>
        <ThemedText type="small" themeColor="income">
          +{money(status.accrued)}
        </ThemedText>
      </View>

      {status.progress !== null && status.maturity ? (
        <View style={styles.term}>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.fill,
                { width: `${status.progress * 100}%`, backgroundColor: theme.accent },
              ]}
            />
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            {matured
              ? `Хугацаа дууссан · ${formatLongDate(status.maturity)}`
              : `${formatLongDate(status.maturity)} хүртэл · ${status.daysLeft} хоног үлдсэн`}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText type="caption" themeColor="textSecondary">
        {matured
          ? `Эцсийн дүн ${money(status.atMaturity ?? status.balance)}`
          : `Сард +${money(perMonth)} хүү${status.atMaturity ? ` · Эцэст нь ${money(status.atMaturity)}` : ''}`}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.large + 2, padding: Spacing.three, gap: Spacing.three },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  tile: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGlyph: { fontSize: 20, lineHeight: 26 },
  titles: { flex: 1, gap: 2 },
  rate: { borderRadius: Radius.pill, paddingHorizontal: Spacing.two, paddingVertical: 2 },
  amounts: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  balance: { flexShrink: 1 },
  term: { gap: Spacing.one },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
