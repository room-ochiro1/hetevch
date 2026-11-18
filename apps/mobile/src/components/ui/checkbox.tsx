import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Spoken label; the visible label (children) may hold links, which stay tappable. */
  accessibilityLabel: string;
  children: ReactNode;
};

/** A square tick box with its label beside it; the whole row toggles. */
export function Checkbox({ checked, onChange, accessibilityLabel, children }: CheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onChange(!checked)}
      hitSlop={6}
      style={styles.row}>
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.accent : theme.textSecondary,
            backgroundColor: checked ? theme.accent : 'transparent',
          },
        ]}>
        {checked ? <Icon name="check" color={theme.onAccent} size={16} /> : null}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: Radius.small - 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
