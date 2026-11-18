import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { SavingsPromo } from '@/components/drawer/savings-promo';
import { openNewTransaction } from '@/components/finance/kind-options';
import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Go = (after?: () => void) => void;

type Item = { icon: IconName; label: string; open?: () => void };

const SECTIONS: readonly Item[] = [
  { icon: 'overview', label: 'Тойм' },
  { icon: 'savings', label: 'Хадгаламж', open: () => router.push('/savings/accounts') },
  { icon: 'calculator', label: 'Хүүгийн тооцоолуур', open: () => router.push('/savings/calculator') },
];

const QUICK_ACTIONS: readonly Item[] = [
  { icon: 'expense', label: 'Зарлага нэмэх', open: () => openNewTransaction({ kind: 'expense' }) },
  { icon: 'income', label: 'Орлого нэмэх', open: () => openNewTransaction({ kind: 'income' }) },
];

/** The wide column: app name, sections, quick actions and the savings card. */
export function DrawerPanel({ go }: { go: Go }) {
  const theme = useTheme();

  function row(item: Item, current = false) {
    return (
      <Pressable
        key={item.label}
        accessibilityRole="button"
        accessibilityState={{ selected: current }}
        onPress={() => go(item.open)}
        style={({ pressed }) => [
          styles.item,
          current && { backgroundColor: theme.accent },
          pressed && !current && { backgroundColor: theme.surface },
        ]}>
        <Icon name={item.icon} color={current ? theme.onAccent : theme.accentText} />
        <ThemedText
          type="smallBold"
          numberOfLines={1}
          style={[styles.label, { color: current ? theme.onAccent : theme.text }]}>
          {item.label}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Шинэ гүйлгээ нэмэх"
        onPress={() => go(() => openNewTransaction())}
        style={[styles.brand, { borderColor: theme.border }]}>
        <ThemedText type="smallBold" themeColor="accentText" style={styles.brandName}>
          Хэтэвч
        </ThemedText>
        <View style={[styles.brandAdd, { backgroundColor: theme.accent }]}>
          <Icon name="add" size={16} color={theme.onAccent} />
        </View>
      </Pressable>

      <View style={styles.list}>{SECTIONS.map((item, index) => row(item, index === 0))}</View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.list}>{QUICK_ACTIONS.map((item) => row(item))}</View>

      <View style={styles.bottom}>
        <SavingsPromo onOpen={() => go(() => router.push('/savings/accounts'))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.four,
  },
  brand: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
  },
  brandName: {
    flex: 1,
    fontSize: 16,
  },
  brandAdd: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.one,
  },
  item: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  label: {
    flex: 1,
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  bottom: {
    marginTop: 'auto',
  },
});
