import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeSwitch } from '@/components/drawer/theme-switch';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';

type Go = (after?: () => void) => void;

const TABS: readonly { icon: IconName; label: string; open?: () => void }[] = [
  { icon: 'home', label: 'Нүүр' },
  { icon: 'transactions', label: 'Гүйлгээ', open: () => router.navigate('/transactions') },
  { icon: 'profile', label: 'Профайл', open: () => router.navigate('/profile') },
];

/** The narrow column: logo, the app's three tabs, the light/dark switch and the avatar. */
export function DrawerRail({ go }: { go: Go }) {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const initial = (profile?.full_name?.trim() || profile?.email || '?').charAt(0).toUpperCase();

  return (
    <View style={[styles.rail, { borderColor: theme.border }]}>
      <View style={[styles.logo, { backgroundColor: theme.accent }]}>
        <Text style={styles.logoGlyph}>👛</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab, index) => {
          // The drawer opens from the home tab, so that one is current.
          const current = index === 0;
          return (
            <Pressable
              key={tab.icon}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: current }}
              onPress={() => go(tab.open)}
              style={[styles.tab, current && { backgroundColor: theme.accent }]}>
              <Icon name={tab.icon} color={current ? theme.onAccent : theme.accentText} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemeSwitch />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Хувийн мэдээлэл"
          onPress={() => go(() => router.push('/settings/account'))}
          style={[styles.avatar, { backgroundColor: theme.peach }]}>
          <Text style={[styles.avatarText, { color: theme.peachInk }]}>{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 76,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontSize: 22,
    lineHeight: 28,
  },
  tabs: {
    marginTop: Spacing.six,
    gap: Spacing.three,
  },
  tab: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: Spacing.three,
  },
  divider: {
    width: 44,
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 700,
  },
});
