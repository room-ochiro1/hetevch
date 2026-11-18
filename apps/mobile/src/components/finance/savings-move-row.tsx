import { formatLongDate, formatNumericDate, type SavingsMove } from '@hetevch/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { ThemedText } from '@/components/themed-text';
import { cardColor } from '@/constants/savings-appearance';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

type SavingsMoveRowProps = { move: SavingsMove };

/**
 * Money put into (−) or taken out of (+) a savings card, styled like a transaction row with
 * the card's picture and colour. Tapping opens the card, where movements are managed.
 */
export function SavingsMoveRow({ move }: SavingsMoveRowProps) {
  const theme = useTheme();
  const money = useMoney();
  const base = move.base_amount ?? 0;
  const label = base > 0 ? 'Хадгаламж руу' : 'Хадгаламжаас';
  const cardName = move.card?.name ?? 'Устгасан карт';
  const amount = `${base > 0 ? '−' : '+'}${money.format(Math.abs(base))}`;
  const when = formatNumericDate(move.occurred_on);
  const cardId = move.card?.id;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${cardName}, ${amount}, ${formatLongDate(move.occurred_on)}${move.note ? `, ${move.note}` : ''}`}
      accessibilityHint="Картыг нээх бол дарна уу"
      disabled={!cardId}
      onPress={() => cardId && router.push({ pathname: '/savings/[id]', params: { id: cardId } })}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.backgroundElement : theme.surface },
      ]}>
      <CategoryIcon
        category={{ icon: move.card?.icon ?? '🐷', color: cardColor(move.card?.color ?? '') }}
      />
      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
          {move.note || label}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
          {move.note ? `${label} · ${cardName}` : cardName}
        </ThemedText>
      </View>
      <View style={styles.right}>
        <ThemedText type="smallBold" style={styles.amount}>
          {amount}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {when}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    minHeight: 72,
  },
  middle: { flex: 1, gap: Spacing.half },
  name: { fontSize: 15 },
  right: { alignItems: 'flex-end', gap: Spacing.half },
  amount: { fontSize: 15, fontVariant: ['tabular-nums'] },
});
