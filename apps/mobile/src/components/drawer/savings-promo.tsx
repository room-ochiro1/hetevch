import { summarizeSavings, toISODate } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useSavingsCards } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

/**
 * The card at the bottom of the drawer: total savings and this month's interest once there are
 * cards, otherwise an invitation to make the first one.
 */
export function SavingsPromo({ onOpen }: { onOpen: () => void }) {
  const theme = useTheme();
  const money = useMoney();
  const { data } = useSavingsCards();
  const summary = data && data.length > 0 ? summarizeSavings(data, toISODate(new Date())) : null;
  const earns = summary && Object.values(summary.perMonth).some((value) => value);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.accentSoft, borderColor: withAlpha(theme.accent, 0.35) },
      ]}>
      {summary ? (
        <View style={styles.text}>
          <ThemedText type="caption" themeColor="accentText">
            Нийт хадгаламж · {summary.count} карт
          </ThemedText>
          <ThemedText type="heading" numberOfLines={1} adjustsFontSizeToFit>
            {money.combine(summary.balance)}
          </ThemedText>
          {earns ? (
            <ThemedText type="caption" themeColor="income">
              Сард +{money.combine(summary.perMonth)} хүү
            </ThemedText>
          ) : null}
        </View>
      ) : (
        <ThemedText type="small" themeColor="accentText" style={styles.center}>
          Зорилго бүрт хадгаламжийн карт үүсгээд мөнгөө хуримтлуулаарай
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
          {summary ? 'Картууд харах' : '+ Карт үүсгэх'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.large, padding: Spacing.three, gap: Spacing.three },
  text: { gap: Spacing.half },
  center: { textAlign: 'center' },
  button: {
    minHeight: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  pressed: { opacity: 0.8 },
  buttonLabel: { fontSize: 15, fontWeight: 700 },
});
