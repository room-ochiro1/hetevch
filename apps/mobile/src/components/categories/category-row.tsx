import type { Category } from '@hetevch/shared';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CategoryRowProps = {
  category: Category;
  /** Without it the row is read-only (built-in categories). */
  onPress?: () => void;
};

/** One category in a SettingsGroup: its icon tile in the category color, then the name. */
export function CategoryRow({ category, onPress }: CategoryRowProps) {
  const theme = useTheme();
  const content = (
    <View style={styles.row}>
      <CategoryIcon category={category} size={34} />
      <ThemedText style={styles.name} numberOfLines={1}>
        {category.name}
      </ThemedText>
      {onPress ? (
        <ThemedText themeColor="textSecondary" style={styles.chevron}>
          ›
        </ThemedText>
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, засах`}
      onPress={onPress}
      style={({ pressed }) => pressed && { backgroundColor: theme.backgroundSelected }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  name: { flex: 1 },
  chevron: { fontSize: 22, lineHeight: 24 },
});
