import { formatDayLabel, type TransactionListItem } from '@hetevch/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

type TransactionRowProps = {
  item: TransactionListItem;
  /** Show the day under the amount; otherwise the time it was added (lists grouped by day). */
  showDate?: boolean;
};

/** "14:05" in the phone's time zone. */
function formatClock(timestamp: string): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** One transaction on its own soft card; tapping opens it for editing. */
export function TransactionRow({ item, showDate }: TransactionRowProps) {
  const theme = useTheme();
  const name = item.category?.name ?? 'Ангилалгүй';
  const amount = useMoney().forKind(item);
  const when = showDate ? formatDayLabel(item.occurred_on) : formatClock(item.created_at);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${amount}, ${when}${item.note ? `, ${item.note}` : ''}`}
      accessibilityHint="Засах бол дарна уу"
      onPress={() => router.push({ pathname: '/transaction', params: { id: item.id } })}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.backgroundElement : theme.surface },
      ]}>
      <CategoryIcon category={item.category} />
      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
          {item.note || name}
        </ThemedText>
        {/* With a note, the note is the title and the category goes underneath; without one,
            the category is the title and repeating it would only add noise. */}
        {item.note ? (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {name}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.right}>
        <ThemedText
          type="smallBold"
          themeColor={item.kind === 'income' ? 'income' : 'text'}
          style={styles.amount}>
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
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 15,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
  amount: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
});
