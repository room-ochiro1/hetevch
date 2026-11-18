import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryForm } from '@/components/savings/entry-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { StateMessage } from '@/components/ui/state-message';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSavingsCard } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

/** Modal sheet: `?accountId=<uuid>&type=in|out` puts money into a card or takes it out. */
export default function SavingsEntryScreen() {
  const theme = useTheme();
  const { accountId, type } = useLocalSearchParams<{ accountId?: string; type?: string }>();
  const { data: card, error } = useSavingsCard(accountId);
  const direction = type === 'out' ? 'out' : 'in';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { borderColor: theme.border }]}>
            <ThemedText type="heading" accessibilityRole="header" numberOfLines={1} style={styles.title}>
              {card ? `${card.icon} ${card.name}` : 'Хадгаламж'}
            </ThemedText>
            <IconButton icon="close" label="Хаах" onPress={() => router.back()} />
          </View>
          <View style={styles.body}>
            {error || !accountId ? (
              <StateMessage
                tone="error"
                icon="⚠️"
                title="Картыг ачаалж чадсангүй"
                body="Цонхоо хаагаад дахин оролдоно уу."
              />
            ) : card ? (
              <EntryForm card={card} initialDirection={direction} />
            ) : (
              <ActivityIndicator color={theme.accent} style={styles.spinner} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
  },
  title: { flex: 1 },
  body: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  spinner: { paddingVertical: Spacing.six },
});
