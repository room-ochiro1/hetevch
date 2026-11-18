import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemeSwitch } from '@/components/drawer/theme-switch';
import { Icon, type IconName } from '@/components/ui/icon';
import { Logo } from '@/components/ui/logo';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Go = (after?: () => void) => void;

const TABS: readonly { icon: IconName; label: string; open?: () => void }[] = [
  { icon: 'home', label: 'Нүүр' },
  { icon: 'transactions', label: 'Гүйлгээ', open: () => router.navigate('/transactions') },
  { icon: 'profile', label: 'Профайл', open: () => router.navigate('/profile') },
];

/** The narrow outer column: logo, three main tabs and the light/dark switch. */
export function DrawerRail({ go }: { go: Go }) {
  const theme = useTheme();

  return (
    <View style={[styles.rail, { borderColor: theme.border }]}>
      <Logo size={44} />

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 76,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderLeftWidth: StyleSheet.hairlineWidth,
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
});
