import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type SectionProps = {
  title: string;
  /** Optional link on the right of the title, e.g. "Бүгд". */
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
};

export function Section({ title, actionLabel, onAction, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="heading" accessibilityRole="header">
          {title}
        </ThemedText>
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="link" hitSlop={12} onPress={onAction}>
            <ThemedText type="smallBold" themeColor="accentText">
              {actionLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
