import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Where a row's text starts (row padding + icon tile + gap); dividers start there too. */
export const ROW_TEXT_INSET = Spacing.three + 34 + Spacing.three;

type SettingsGroupProps = {
  title?: string;
  /** Small explanation under the block. */
  footer?: string;
  children: ReactNode;
};

/** A titled, rounded block of rows with hairlines between them, like the system settings. */
export function SettingsGroup({ title, footer, children }: SettingsGroupProps) {
  const theme = useTheme();
  // toArray drops null/false, so a hidden row leaves no stray divider.
  const rows = Children.toArray(children);

  return (
    <View style={styles.group}>
      {title ? (
        <ThemedText
          type="smallBold"
          themeColor="textSecondary"
          accessibilityRole="header"
          style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.footer}>
          {footer}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  title: {
    paddingHorizontal: Spacing.one,
  },
  card: {
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_TEXT_INSET,
  },
  footer: {
    paddingHorizontal: Spacing.one,
  },
});
