import { formatAmount, formatDayLabel, type SavingsCard, type SavingsEntry } from '@hetevch/shared';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { SettingsGroup } from '@/components/settings/settings-group';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteSavingsEntry } from '@/lib/savings';
import { useFinanceData } from '@/providers/finance-data';

/** Money put in and taken out, newest first, ending with the opening balance. */
export function EntryHistory({ card }: { card: SavingsCard }) {
  const { invalidate } = useFinanceData();
  const opening = Number(card.principal);

  function confirmDelete(entry: SavingsEntry) {
    Alert.alert('Энэ бичлэгийг устгах уу?', 'Картын үлдэгдэл үүнийг тооцохгүй болно.', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: async () => {
          const error = await deleteSavingsEntry(entry.id);
          if (error) Alert.alert('Алдаа', error);
          else invalidate();
        },
      },
    ]);
  }

  if (card.entries.length === 0 && opening === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
        Одоохондоо мөнгө хийгээгүй байна. «+ Мөнгө хийх» дарж эхлээрэй.
      </ThemedText>
    );
  }

  return (
    <SettingsGroup title="Түүх" footer="Бичлэг дээр дарж устгана.">
      {card.entries.map((entry) => (
        <EntryRow
          key={entry.id}
          amount={Number(entry.amount)}
          day={entry.occurred_on}
          note={entry.note}
          currency={card.currency}
          onPress={() => confirmDelete(entry)}
        />
      ))}
      {opening > 0 ? (
        <EntryRow amount={opening} day={card.start_date} note="Эхний дүн" currency={card.currency} />
      ) : null}
    </SettingsGroup>
  );
}

type EntryRowProps = {
  amount: number;
  day: string;
  note: string | null;
  currency: SavingsCard['currency'];
  onPress?: () => void;
};

function EntryRow({ amount, day, note, currency, onPress }: EntryRowProps) {
  const theme = useTheme();
  const isIn = amount > 0;
  const text = `${isIn ? '+' : '−'}${formatAmount(Math.abs(amount), currency)}`;

  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${formatDayLabel(day)}, ${note ?? ''} ${text}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
      <View style={styles.text}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {note || (isIn ? 'Хийсэн' : 'Авсан')}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {formatDayLabel(day)}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor={isIn ? 'income' : 'expense'}>
        {text}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: Spacing.three },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  text: { flex: 1, gap: 2 },
});
