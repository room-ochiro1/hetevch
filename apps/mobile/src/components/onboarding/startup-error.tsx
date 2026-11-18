import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type StartupErrorProps = {
  message: string;
  onRetry: () => void;
};

/** Shown on the very first launch when the phone can't reach the server yet. */
export function StartupError({ message, onRetry }: StartupErrorProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Logo size={64} />
          <ThemedText type="heading">Холболт алга</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.message}>
            {message}
          </ThemedText>
          <Button title="Дахин оролдох" onPress={onRetry} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  message: {
    textAlign: 'center',
  },
});
