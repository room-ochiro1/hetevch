import { formatMoney, type CategoryShare, type CategorySummary, type TransactionKind } from '@hetevch/shared';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { openNewTransaction } from '@/components/finance/kind-options';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useCategoryColor } from '@/hooks/use-category-color';
import { useTheme } from '@/hooks/use-theme';

type CategoryRowsProps = {
  shares: readonly CategoryShare<CategorySummary>[];
  kind: TransactionKind;
};

/**
 * The ring's legend and its numbers: one row per category with amount, share and a bar in
 * the category's color. Tapping a row adds to that category, so logging is "pick, type, save".
 */
export function CategoryRows({ shares, kind }: CategoryRowsProps) {
  const theme = useTheme();
  const { colorOf } = useCategoryColor();

  return (
    <View style={styles.list}>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.hint}>
        Ангилал дээр дарж шууд нэмнэ
      </ThemedText>
      {shares.map(({ category, total, share }) => {
        const percent = Math.round(share * 100);
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={`${category.name}: ${formatMoney(total)}, ${percent} хувь`}
            accessibilityHint={`${category.name} ангилалд шинэ гүйлгээ нэмнэ`}
            onPress={() => openNewTransaction({ kind, categoryId: category.id })}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? theme.backgroundElement : theme.surface },
            ]}>
            <CategoryIcon category={category} size={42} />
            <View style={styles.body}>
              <View style={styles.line}>
                <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
                  {category.name}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.tabular}>
                  {formatMoney(total)}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary" style={styles.percent}>
                  {percent}%
                </ThemedText>
              </View>
              <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.max(share * 100, 2)}%`, backgroundColor: colorOf(category.color) },
                  ]}
                />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  hint: {
    paddingHorizontal: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  percent: {
    width: 36,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
