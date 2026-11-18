import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { USER_CATEGORY_COLORS } from '@/constants/category-colors';
import { Spacing } from '@/constants/theme';
import { useCategoryColor } from '@/hooks/use-category-color';
import { useTheme } from '@/hooks/use-theme';

/** Names in USER_CATEGORY_COLORS order (blue, orange, aqua, yellow, magenta, green, violet, red). */
const COLOR_NAMES = ['Цэнхэр', 'Улбар шар', 'Оюу', 'Шар', 'Ягаан', 'Ногоон', 'Нил ягаан', 'Улаан'];

type ColorSwatchesProps = {
  value: string;
  onChange: (color: string) => void;
};

/** The palette colors a user category can take, each drawn in the active theme's shade. */
export function ColorSwatches({ value, onChange }: ColorSwatchesProps) {
  const theme = useTheme();
  const { colorOf } = useCategoryColor();

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        Өнгө
      </ThemedText>
      <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Ангиллын өнгө">
        {USER_CATEGORY_COLORS.map((color, index) => {
          const selected = value.toUpperCase() === color;
          return (
            <Pressable
              key={color}
              accessibilityRole="radio"
              accessibilityLabel={COLOR_NAMES[index] ?? color}
              accessibilityState={{ selected }}
              onPress={() => onChange(color)}
              style={[styles.ring, { borderColor: selected ? theme.text : 'transparent' }]}>
              <View style={[styles.swatch, { backgroundColor: colorOf(color) }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 32, height: 32, borderRadius: 16 },
});
