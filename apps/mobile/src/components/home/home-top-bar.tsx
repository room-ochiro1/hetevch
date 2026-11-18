import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';

/** Only the user's avatar, top right; it opens the side menu (profile, theme, shortcuts). */
export function HomeTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const initial = (profile?.full_name?.trim() || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Профайл ба цэс"
        onPress={onOpenMenu}
        hitSlop={6}
        style={({ pressed }) => [
          styles.avatar,
          { backgroundColor: theme.peach },
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.initial, { color: theme.peachInk }]}>{initial}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'flex-end' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 20, fontWeight: 700 },
  pressed: { opacity: 0.8 },
});
