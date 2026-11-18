import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Logo } from '@/components/ui/logo';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HomeActionsProps = {
  onExpense: () => void;
  onIncome: () => void;
};

/** Зарлага · the Хэтэвч logo · Орлого. The logo is only the brand mark, not a button. */
export function HomeActions({ onExpense, onIncome }: HomeActionsProps) {
  return (
    <View style={styles.row}>
      <PillButton label="Зарлага" icon="expense" tone="expense" onPress={onExpense} />
      <Logo size={68} />
      <PillButton label="Орлого" icon="income" tone="income" onPress={onIncome} />
    </View>
  );
}

type PillButtonProps = { label: string; icon: IconName; tone: ThemeColor; onPress: () => void };

function PillButton({ label, icon, tone, onPress }: PillButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} нэмэх`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
      ]}>
      <Icon name={icon} color={theme[tone]} size={20} />
      <Text style={[styles.pillText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pill: {
    flex: 1,
    minHeight: 60,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  pillText: { fontSize: 17, fontWeight: 700 },
});
