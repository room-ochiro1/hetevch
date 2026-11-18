import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconButtonProps = {
  /** A single glyph such as "+", "‹", "›" or "✕"… */
  glyph?: string;
  /** …or a line icon (wins over `glyph`). */
  icon?: IconName;
  /** Spoken by screen readers; the glyph alone means nothing to them. */
  label: string;
  onPress: () => void;
  variant?: 'accent' | 'plain';
  /** Round for inline controls; a soft rounded square for header actions. */
  shape?: 'round' | 'square';
  disabled?: boolean;
};

/** A 44pt button for compact actions (add, close, previous/next). */
export function IconButton({
  glyph,
  icon,
  label,
  onPress,
  variant = 'plain',
  shape = 'round',
  disabled,
}: IconButtonProps) {
  const theme = useTheme();
  const isAccent = variant === 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        shape === 'square' ? styles.square : styles.round,
        { backgroundColor: isAccent ? theme.accent : theme.backgroundElement },
        (pressed || disabled) && styles.dimmed,
      ]}>
      {icon ? (
        <Icon name={icon} color={isAccent ? theme.onAccent : theme.text} />
      ) : (
        <Text style={[styles.glyph, { color: isAccent ? theme.onAccent : theme.text }]}>{glyph}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    borderRadius: Radius.pill,
  },
  square: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
  },
  dimmed: {
    opacity: 0.4,
  },
  glyph: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 600,
  },
});
