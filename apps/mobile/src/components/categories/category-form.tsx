import { CATEGORY_NAME_MAX } from '@hetevch/shared';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ColorSwatches } from '@/components/categories/color-swatches';
import { EmojiField } from '@/components/categories/emoji-field';
import { useCategoryForm, type CategoryFormOptions } from '@/components/categories/use-category-form';
import { KIND_OPTIONS } from '@/components/finance/kind-options';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Emoji → name → kind (new only: transactions are tied to it) → color. Save sits in a footer
 * above the keyboard, as in the transaction sheet.
 */
export function CategoryForm(options: CategoryFormOptions) {
  const theme = useTheme();
  const form = useCategoryForm(options);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <EmojiField value={form.icon} onChange={form.setIcon} color={form.color} />

        <TextField
          label="Нэр"
          value={form.name}
          onChangeText={form.setName}
          placeholder="Жишээ нь: Тэжээвэр амьтан"
          maxLength={CATEGORY_NAME_MAX}
          returnKeyType="done"
        />

        {form.isEditing ? null : (
          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Төрөл
            </ThemedText>
            <Segmented
              options={KIND_OPTIONS}
              value={form.kind}
              onChange={form.setKind}
              accessibilityLabel="Ангиллын төрөл"
            />
          </View>
        )}

        <ColorSwatches value={form.color} onChange={form.setColor} />

        {form.isEditing ? (
          <Button
            variant="danger"
            title="Устгах"
            onPress={form.confirmDelete}
            loading={form.busy === 'deleting'}
            disabled={form.busy !== null}
          />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { borderColor: theme.border, backgroundColor: theme.background }]}>
        {form.error ? (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {form.error}
          </ThemedText>
        ) : null}
        <Button
          title={form.isEditing ? 'Хадгалах' : 'Нэмэх'}
          onPress={form.submit}
          loading={form.busy === 'saving'}
          disabled={form.busy !== null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.four },
  field: { gap: Spacing.two },
  footer: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
