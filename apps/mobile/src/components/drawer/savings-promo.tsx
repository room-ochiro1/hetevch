import { formatMoney, summarizeSavings, toISODate } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useSavingsAccounts } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

/**
 * The card at the bottom of the drawer: total savings and this month's interest once there are
 * accounts, otherwise an invitation to add the first one.
 */
export function SavingsPromo({ onOpen }: { onOpen: () => void }) {
  const theme = useTheme();
  const { data } = useSavingsAccounts();
  const summary = data && data.length > 0 ? summarizeSavings(data, toISODate(new Date())) : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.accentSoft, borderColor: withAlpha(theme.accent, 0.35) },
      ]}>
      {summary ? (
        <View style={styles.text}>
          <ThemedText type="caption" themeColor="accentText">
            Нийт хадгаламж
          </ThemedText>
          <ThemedText type="heading" numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(Math.round(summary.balance))}
          </ThemedText>
          <ThemedText type="caption" themeColor="income">
            Сард +{formatMoney(Math.round(summary.perMonth))} хүү
          </ThemedText>
        </View>
      ) : (
        <ThemedText type="small" themeColor="accentText" style={styles.center}>
          Хадгаламжаа бүртгээд хүүгээ өдөр, сар, жилээр хянаарай
        </ThemedText>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.accent },
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.buttonLabel, { color: theme.onAccent }]}>
          {summary ? 'Хадгаламж харах' : '+ Хадгаламж нэмэх'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  text: {
    gap: Spacing.half,
  },
  center: {
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: 700,
  },
});
