import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROW_TEXT_INSET } from '@/components/settings/settings-group';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Soft tile behind the row's emoji; danger marks rows that sign out or delete. */
export type RowTone = 'accent' | 'mint' | 'peach' | 'lavender' | 'danger';

const TILE = {
  accent: 'accentSoft',
  mint: 'mint',
  peach: 'peach',
  lavender: 'lavender',
  danger: 'expenseSoft',
} as const;

type SettingsRowProps = {
  icon: string;
  tone: RowTone;
  label: string;
  /** Current value on the right, e.g. an email. */
  value?: string;
  /** Without it the row is informational: no chevron, no press feedback. */
  onPress?: () => void;
  /** Controls shown under the label, e.g. a segmented picker. */
  children?: ReactNode;
};

export function SettingsRow({ icon, tone, label, value, onPress, children }: SettingsRowProps) {
  const theme = useTheme();
  const isDanger = tone === 'danger';

  const content = (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: theme[TILE[tone]] }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <ThemedText style={styles.label} themeColor={isDanger ? 'danger' : 'text'} numberOfLines={1}>
        {label}
      </ThemedText>
      {value ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.value}>
          {value}
        </ThemedText>
      ) : null}
      {onPress && !isDanger ? (
        <ThemedText themeColor="textSecondary" style={styles.chevron}>
          ›
        </ThemedText>
      ) : null}
    </View>
  );

  if (!onPress) {
    return (
      <View>
        {content}
        {children ? <View style={styles.below}>{children}</View> : null}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      style={({ pressed }) => pressed && { backgroundColor: theme.backgroundSelected }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  tile: {
    width: 34,
    height: 34,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 17,
    lineHeight: 22,
  },
  label: {
    flex: 1,
  },
  value: {
    maxWidth: '50%',
  },
  chevron: {
    fontSize: 24,
    lineHeight: 28,
    marginTop: -2,
  },
  below: {
    paddingLeft: ROW_TEXT_INSET,
    paddingRight: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
