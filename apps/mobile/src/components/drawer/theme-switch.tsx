import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/providers/theme-preference';

const MODES: readonly { scheme: 'light' | 'dark'; icon: IconName; label: string }[] = [
  { scheme: 'light', icon: 'sun', label: 'Цайвар горим' },
  { scheme: 'dark', icon: 'moon', label: 'Бараан горим' },
];

/** Vertical sun / moon pill; the filled one is the mode on screen now. */
export function ThemeSwitch() {
  const theme = useTheme();
  const active = useColorScheme() === 'dark' ? 'dark' : 'light';
  const { setPreference } = useThemePreference();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Өнгөний горим"
      style={[styles.pill, { borderColor: theme.border }]}>
      {MODES.map((mode) => {
        const selected = mode.scheme === active;
        return (
          <Pressable
            key={mode.scheme}
            accessibilityRole="radio"
            accessibilityLabel={mode.label}
            accessibilityState={{ selected }}
            hitSlop={4}
            onPress={() => setPreference(mode.scheme)}
            style={[styles.option, selected && { backgroundColor: theme.accent }]}>
            <Icon
              name={mode.icon}
              size={20}
              color={selected ? theme.onAccent : theme.accentText}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    padding: Spacing.one,
    gap: Spacing.two,
  },
  option: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
