import { ageFromBirthYear } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';

/** Who is signed in, at the top of the side menu; opens the profile tab. */
export function DrawerProfile({ onOpen }: { onOpen: () => void }) {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const fullName = profile?.full_name?.trim();
  const initial = (fullName || '?').charAt(0).toUpperCase();
  const detail = profile?.birth_year ? `${ageFromBirthYear(profile.birth_year)} настай` : 'Профайл нээх';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${fullName || 'Профайл'}, ${detail}. Профайл нээх`}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.row,
        { borderColor: theme.border, backgroundColor: pressed ? theme.surface : 'transparent' },
      ]}>
      <View style={[styles.avatar, { backgroundColor: theme.peach }]}>
        <Text style={[styles.initial, { color: theme.peachInk }]}>{initial}</Text>
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {fullName || 'Профайл'}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
          {profile ? detail : ' '}
        </ThemedText>
      </View>
      <Icon name="profile" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    paddingRight: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 17, fontWeight: 700 },
  text: { flex: 1, gap: 1 },
});
