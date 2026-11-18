import type { Profile } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IdentityCardProps = {
  profile: Profile | null;
  onPress: () => void;
};

/** Who is signed in: avatar initial, name and email. Opens the account details. */
export function IdentityCard({ profile, onPress }: IdentityCardProps) {
  const theme = useTheme();
  const fullName = profile?.full_name?.trim();
  const name = fullName || 'Нэрээ оруулаагүй';
  const initial = (fullName || profile?.email || '?').charAt(0).toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${profile?.email ?? ''}. Хувийн мэдээлэл нээх`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.surface },
      ]}>
      <View style={[styles.avatar, { backgroundColor: theme.peach }]}>
        <Text style={[styles.avatarText, { color: theme.peachInk }]}>{initial}</Text>
      </View>
      <View style={styles.text}>
        <ThemedText
          type="heading"
          numberOfLines={1}
          themeColor={fullName ? 'text' : 'textSecondary'}>
          {profile ? name : ' '}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {profile?.email ?? ' '}
        </ThemedText>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.chevron}>
        ›
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large + 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: 700,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 28,
  },
});
