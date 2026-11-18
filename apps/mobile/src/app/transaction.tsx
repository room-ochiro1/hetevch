import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionForm } from '@/components/transaction-form/transaction-form';
import { IconButton } from '@/components/ui/icon-button';
import { StateMessage } from '@/components/ui/state-message';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCategories, useTransaction } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme';

/**
 * Add or edit a transaction, presented as a modal sheet. `?id=<uuid>` edits; for a new one,
 * `?kind=expense|income&categoryId=<uuid>` can pre-select what the user tapped on the overview.
 */
export default function TransactionScreen() {
  const theme = useTheme();
  const { id, kind, categoryId, amount } = useLocalSearchParams<{
    id?: string;
    kind?: string;
    categoryId?: string;
    amount?: string;
  }>();
  const presetKind = kind === 'income' || kind === 'expense' ? kind : undefined;
  // Only a plain number is accepted from the URL.
  const presetAmount = amount && /^\d+(\.\d{1,2})?$/.test(amount) ? amount : undefined;
  const existing = useTransaction(id);
  const categories = useCategories();
  const error = categories.error ?? existing.error;
  const ready = categories.data && (!id || existing.data);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { borderColor: theme.border }]}>
            <ThemedText type="heading" accessibilityRole="header">
              {id ? 'Гүйлгээ засах' : 'Шинэ гүйлгээ'}
            </ThemedText>
            <IconButton glyph="✕" label="Хаах" onPress={() => router.back()} />
          </View>

          <View style={styles.body}>
            {error ? (
              <StateMessage
                tone="error"
                icon="⚠️"
                title="Мэдээлэл ачаалж чадсангүй"
                body="Цонхоо хаагаад дахин оролдоно уу."
              />
            ) : ready ? (
              <TransactionForm
                key={id ?? 'new'}
                initial={existing.data ?? undefined}
                preset={{ kind: presetKind, categoryId, amount: presetAmount }}
                categories={categories.data ?? []}
              />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  spinner: {
    paddingVertical: Spacing.six,
  },
});
