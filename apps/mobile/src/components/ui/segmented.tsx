import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  /** Text color of the selected segment; defaults to the normal text color. */
  tone?: ThemeColor;
};

type SegmentedProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** 'soft': raised white pill on a grey track. 'solid': dark pill, no track (period tabs). */
  variant?: 'soft' | 'solid';
};

/** A pill-shaped single-choice switch (expense/income, theme, period, …). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  variant = 'soft',
}: SegmentedProps<T>) {
  const theme = useTheme();
  const solid = variant === 'solid';

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: solid ? 'transparent' : theme.backgroundElement }]}>
      {options.map((option) => {
        const selected = option.value === value;
        const selectedLabel = solid ? theme.background : theme[option.tone ?? 'text'];
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected &&
                (solid
                  ? { backgroundColor: theme.text }
                  : [styles.selected, { backgroundColor: theme.background }]),
            ]}>
            <Text
              style={[
                styles.label,
                { color: selected ? selectedLabel : theme.textSecondary },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Radius.medium,
    gap: Spacing.one,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: 600,
  },
});
