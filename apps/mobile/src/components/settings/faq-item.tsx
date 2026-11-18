import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { FaqEntry } from '@/content/types';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One question; tap to show or hide its answer. */
export function FaqItem({ entry }: { entry: FaqEntry }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.question, pressed && { backgroundColor: theme.backgroundSelected }]}>
        <ThemedText style={styles.questionText}>{entry.question}</ThemedText>
        <ThemedText
          themeColor="textSecondary"
          style={[styles.chevron, open && styles.chevronOpen]}
          importantForAccessibility="no">
          ›
        </ThemedText>
      </Pressable>
      {open ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.answer}>
          {entry.answer}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  questionText: {
    flex: 1,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 28,
    transform: [{ rotate: '90deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '-90deg' }],
  },
  answer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    lineHeight: 21,
  },
});
