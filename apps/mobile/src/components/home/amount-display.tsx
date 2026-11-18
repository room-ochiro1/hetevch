import { formatAmountInput } from '@hetevch/shared';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AmountDisplayProps = {
  text: string;
  symbol: string;
  /** Small line under the number: a tip while empty, a conversion once typed. */
  hint?: string;
};

/** The big number being typed, with the currency sign raised beside it. */
export function AmountDisplay({ text, symbol, hint }: AmountDisplayProps) {
  const theme = useTheme();
  const shown = formatAmountInput(text) || '0';

  return (
    <View style={styles.container} accessible accessibilityLiveRegion="polite" accessibilityLabel={`${shown} ${symbol}`}>
      <View style={styles.row}>
        <Text style={[styles.amount, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {shown}
        </Text>
        <Text style={[styles.symbol, { color: theme.text }]}>{symbol}</Text>
      </View>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.one, maxWidth: '100%' },
  amount: {
    fontSize: 72,
    lineHeight: 84,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  symbol: { fontSize: 36, lineHeight: 44, fontWeight: 700, marginTop: Spacing.two },
  hint: { textAlign: 'center' },
});
