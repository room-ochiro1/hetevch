import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type StateMessageProps = {
  /** An emoji that sets the tone, e.g. "🧾". */
  icon: string;
  title: string;
  body?: string;
  tone?: 'neutral' | 'error';
};

/** Empty and error states. Errors use the danger color so they never pass for "no data". */
export function StateMessage({ icon, title, body, tone = 'neutral' }: StateMessageProps) {
  const isError = tone === 'error';

  return (
    <View style={styles.container} accessibilityRole={isError ? 'alert' : undefined}>
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <ThemedText type="smallBold" themeColor={isError ? 'danger' : 'text'} style={styles.center}>
        {title}
      </ThemedText>
      {body ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {body}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  icon: {
    fontSize: 32,
    lineHeight: 40,
  },
  center: {
    textAlign: 'center',
  },
});
