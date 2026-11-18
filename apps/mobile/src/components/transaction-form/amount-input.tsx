import { CURRENCY_INFO, formatAmountInput, type Currency, type TransactionKind } from '@hetevch/shared';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Common round amounts per currency: one tap instead of typing. */
const QUICK_AMOUNTS: Record<Currency, readonly number[]> = {
  MNT: [1000, 5000, 10000, 20000, 50000],
  USD: [1, 5, 10, 20, 50],
};

type AmountInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  kind: TransactionKind;
  /** The currency being typed in (the user's display currency). */
  currency: Currency;
  /** Small line under the amount, e.g. what it is in tögrög. */
  hint?: string;
  autoFocus?: boolean;
};

/** The big centered amount (grouped as you type), tinted by kind, plus quick-amount chips. */
export function AmountInput({ value, onChangeText, kind, currency, hint, autoFocus }: AmountInputProps) {
  const theme = useTheme();
  const color = kind === 'income' ? theme.income : theme.text;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.sign, { color }]}>{kind === 'income' ? '+' : '−'}</Text>
        <TextInput
          accessibilityLabel="Дүн"
          value={value}
          onChangeText={(text) => onChangeText(formatAmountInput(text))}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          maxLength={20}
          style={[styles.input, { color }]}
        />
        <Text style={[styles.currency, { color: theme.textSecondary }]}>
          {CURRENCY_INFO[currency].symbol}
        </Text>
      </View>
      {hint ? (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>{hint}</Text>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chips}>
        {QUICK_AMOUNTS[currency].map((amount) => {
          const label = formatAmountInput(String(amount));
          const selected = value === label;
          return (
            <Pressable
              key={amount}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${CURRENCY_INFO[currency].label.toLowerCase()}`}
              accessibilityState={{ selected }}
              onPress={() => onChangeText(label)}
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: selected ? theme.accentSoft : theme.surface },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.chipText, { color: selected ? theme.accentText : theme.text }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: -Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  sign: {
    fontSize: 36,
    fontWeight: 700,
  },
  input: {
    minWidth: 60,
    maxWidth: '80%',
    fontSize: 44,
    fontWeight: 700,
    textAlign: 'center',
    paddingVertical: 0,
  },
  currency: {
    fontSize: 32,
    fontWeight: 600,
  },
  chips: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 15,
    fontWeight: 600,
  },
});
