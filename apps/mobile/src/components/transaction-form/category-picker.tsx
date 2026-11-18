import type { Category } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CategoryPickerProps = {
  categories: readonly Category[];
  value: string | null;
  onChange: (id: string) => void;
};

/** A wrapping grid of category tiles; the selected one gets an accent outline. */
export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Ангилал">
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={category.name}
            onPress={() => onChange(category.id)}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: selected ? theme.accentSoft : theme.surface,
                borderColor: selected ? theme.accent : theme.border,
              },
              pressed && styles.pressed,
            ]}>
            <CategoryIcon category={category} size={40} />
            <Text
              numberOfLines={2}
              style={[styles.name, { color: selected ? theme.accentText : theme.text }]}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    // Three per row on phones; the gap is subtracted by flexBasis + grow.
    flexBasis: '30%',
    flexGrow: 1,
    maxWidth: '33%',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: 600,
    textAlign: 'center',
  },
});
