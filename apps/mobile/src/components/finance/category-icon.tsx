import type { CategorySummary } from '@hetevch/shared';
import { StyleSheet, Text, View } from 'react-native';

import { withAlpha } from '@/constants/theme';
import { useCategoryColor } from '@/hooks/use-category-color';

type CategoryIconProps = {
  category: Pick<CategorySummary, 'icon' | 'color'> | null;
  size?: number;
};

/** The category's emoji on a soft tile of its chart color. Decorative: rows announce the name. */
export function CategoryIcon({ category, size = 44 }: CategoryIconProps) {
  const { colorOf } = useCategoryColor();
  const tint = withAlpha(colorOf(category?.color), 0.16);

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.32, backgroundColor: tint },
      ]}>
      <Text style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>{category?.icon ?? '❔'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
