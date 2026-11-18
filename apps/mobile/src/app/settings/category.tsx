import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryForm } from '@/components/categories/category-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { StateMessage } from '@/components/ui/state-message';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme';

/**
 * Add or edit one of the user's own categories as a modal sheet. `?id=<uuid>` edits;
 * `?kind=expense|income&ownCount=<n>` presets a new one. Built-in categories never open here.
 */
export default function CategoryScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; kind?: string; ownCount?: string }>();
  const { data, error } = useCategories();
  const existing = params.id
    ? data?.find((category) => category.id === params.id && category.owner_id !== null)
    : undefined;
  const kind = params.kind === 'income' || params.kind === 'expense' ? params.kind : undefined;
  const ownCount = Number(params.ownCount) || 0;

  let body;
  if (error) {
    body = (
      <StateMessage
        tone="error"
        icon="⚠️"
        title="Мэдээлэл ачаалж чадсангүй"
        body="Цонхоо хаагаад дахин оролдоно уу."
      />
    );
  } else if (!params.id) {
    body = <CategoryForm kind={kind} ownCount={ownCount} />;
  } else if (existing) {
    body = <CategoryForm key={existing.id} initial={existing} />;
  } else if (data) {
    body = <StateMessage icon="🔍" title="Ангилал олдсонгүй" body="Устгагдсан байж магадгүй." />;
  } else {
    body = <ActivityIndicator color={theme.accent} style={styles.spinner} />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={styles.container}
        edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { borderColor: theme.border }]}>
            <ThemedText type="heading" accessibilityRole="header">
              {params.id ? 'Ангилал засах' : 'Шинэ ангилал'}
            </ThemedText>
            <IconButton icon="close" label="Хаах" onPress={() => router.back()} />
          </View>
          <View style={styles.body}>{body}</View>
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
  },
  body: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  spinner: { paddingVertical: Spacing.six },
});
