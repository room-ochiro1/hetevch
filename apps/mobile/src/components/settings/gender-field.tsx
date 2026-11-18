import { GENDER_LABELS, GENDERS, type Gender } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICONS: Record<Gender, string> = { male: '👨', female: '👩' };

type GenderFieldProps = {
  /** Null until chosen (older accounts have none). */
  value: Gender | null;
  onChange: (gender: Gender) => void;
};

/** "Хүйс": two large Эр / Эм buttons; the chosen one gets the accent outline. */
export function GenderField({ value, onChange }: GenderFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        Хүйс
      </ThemedText>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Хүйс">
        {GENDERS.map((gender) => {
          const selected = gender === value;
          return (
            <Pressable
              key={gender}
              accessibilityRole="radio"
              accessibilityLabel={GENDER_LABELS[gender]}
              accessibilityState={{ selected }}
              onPress={() => onChange(gender)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? theme.accentSoft : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                },
                pressed && styles.pressed,
              ]}>
              <Text style={styles.icon}>{ICONS[gender]}</Text>
              <ThemedText type="smallBold" themeColor={selected ? 'accentText' : 'text'}>
                {GENDER_LABELS[gender]}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 52,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
  },
  icon: { fontSize: 20 },
  pressed: { opacity: 0.7 },
});
