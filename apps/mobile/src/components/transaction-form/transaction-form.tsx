import type { Category, TransactionListItem } from '@hetevch/shared';
import { ScrollView, StyleSheet, View } from 'react-native';

import { KIND_OPTIONS } from '@/components/finance/kind-options';
import { ThemedText } from '@/components/themed-text';
import { AmountInput } from '@/components/transaction-form/amount-input';
import { CategoryPicker } from '@/components/transaction-form/category-picker';
import { DateStepper } from '@/components/transaction-form/date-stepper';
import {
  useTransactionForm,
  type FormPreset,
} from '@/components/transaction-form/use-transaction-form';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TransactionFormProps = {
  initial?: TransactionListItem;
  /** For a new entry: what the user tapped to get here (a kind, maybe a category). */
  preset?: FormPreset;
  categories: readonly Category[];
};

/**
 * Amount → category → save. Date and note are optional extras further down; the save
 * button sits in a footer that stays above the keyboard, so it is never scrolled away.
 */
export function TransactionForm({ initial, preset, categories }: TransactionFormProps) {
  const theme = useTheme();
  const form = useTransactionForm({ initial, preset, categories });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Segmented
          options={KIND_OPTIONS}
          value={form.kind}
          onChange={form.setKind}
          accessibilityLabel="Гүйлгээний төрөл"
        />
        <AmountInput
          value={form.amountText}
          onChangeText={form.setAmountText}
          kind={form.kind}
          currency={form.currency}
          hint={form.amountHint}
          autoFocus={!form.isEditing && !form.hasPresetAmount}
        />

        <View style={styles.field}>
          <ThemedText type="smallBold">Юунд?</ThemedText>
          <CategoryPicker
            categories={form.visibleCategories}
            value={form.categoryId}
            onChange={form.setCategoryId}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Хэзээ?
          </ThemedText>
          <DateStepper value={form.occurredOn} onChange={form.setOccurredOn} />
        </View>

        <TextField
          label="Тэмдэглэл (заавал биш)"
          value={form.note}
          onChangeText={form.setNote}
          placeholder="Жишээ нь: Үдийн хоол"
          maxLength={200}
          returnKeyType="done"
        />

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
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  footer: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
