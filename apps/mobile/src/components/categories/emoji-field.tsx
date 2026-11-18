import { CATEGORY_ICON_MAX } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Quick picks for when switching to the emoji keyboard is a hassle. Any emoji can be typed. */
const SUGGESTIONS = [
  '🐶', '☕', '🎮', '🎓', '💄', '🏋️', '✈️', '🎵', '🚗', '👶',
  '🍺', '⚽', '💻', '🌿', '🎨', '🧾', '💵', '🏦', '🎉', '🛠️',
];

type EmojiFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Stored category color, for the preview tile. */
  color: string;
};

/** Preview tile, a text box for any emoji from the keyboard, and a row of quick picks. */
export function EmojiField({ value, onChange, color }: EmojiFieldProps) {
  const theme = useTheme();
  const current = value.trim();

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <CategoryIcon category={{ icon: current || '❔', color }} size={64} />
        <View style={styles.input}>
          <TextField
            label="Emoji"
            value={value}
            onChangeText={onChange}
            placeholder="Гарын emoji-оос сонго"
            maxLength={CATEGORY_ICON_MAX * 2}
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.emojiText}
          />
        </View>
      </View>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Санал болгох emoji">
        {SUGGESTIONS.map((emoji) => {
          const selected = emoji === current;
          return (
            <Pressable
              key={emoji}
              accessibilityRole="radio"
              accessibilityLabel={emoji}
              accessibilityState={{ selected }}
              onPress={() => onChange(emoji)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? theme.accentSoft : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                },
                pressed && styles.pressed,
              ]}>
              <Text style={styles.chipText}>{emoji}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  top: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.three },
  input: { flex: 1 },
  emojiText: { fontSize: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 22 },
  pressed: { opacity: 0.7 },
});
