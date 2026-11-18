import { type CategoryShare, type CategorySummary } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import type { CardSavings } from '@/components/overview/savings-by-card';
import { ShareRow } from '@/components/overview/share-row';
import type { StatementTarget } from '@/components/statement/open-statement';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCategoryColor } from '@/hooks/use-category-color';

type CategoryRowsProps = {
  shares: readonly CategoryShare<CategorySummary>[];
  /** Savings cards that gained money in the period, as the ring shows them. */
  savings: readonly (CardSavings & { share: number })[];
  /** Opens the tapped category's (or savings') statement for the period on screen. */
  onOpen: (target: StatementTarget) => void;
};

/**
 * The ring's legend and its numbers: one row per category with amount, share and a bar in
 * the category's color. Tapping a row opens its statement (every transaction, totals, change);
 * adding happens there. Savings cards come first, in their own colours (usually the biggest).
 */
export function CategoryRows({ shares, savings, onOpen }: CategoryRowsProps) {
  const { colorOf } = useCategoryColor();

  return (
    <View style={styles.list}>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.hint}>
        Ангилал дээр дарж хуулгыг нь харна
      </ThemedText>
      {savings.map((card) => (
        <ShareRow
          key={card.cardId}
          icon={card.icon}
          iconColor={card.color}
          barColor={card.color}
          name={card.name}
          total={card.total}
          share={card.share}
          onPress={() => onOpen({ type: 'savings', cardId: card.cardId })}
          accessibilityHint="Энэ хадгаламжийн картын хуулгыг нээнэ. Зарлагад тооцогдохгүй."
        />
      ))}
      {shares.map(({ category, total, share }) => (
        <ShareRow
          key={category.id}
          icon={category.icon}
          iconColor={category.color}
          barColor={colorOf(category.color)}
          name={category.name}
          total={total}
          share={share}
          onPress={() => onOpen({ type: 'category', id: category.id })}
          accessibilityHint={`${category.name} ангиллын хуулгыг нээнэ`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  hint: { paddingHorizontal: Spacing.one },
});
