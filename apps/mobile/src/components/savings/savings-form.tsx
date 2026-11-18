import { COMPOUNDING_LABELS, formatMoney, type Compounding, type SavingsAccount } from '@hetevch/shared';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DateField } from '@/components/savings/date-field';
import { useSavingsForm, type SavingsPreset } from '@/components/savings/use-savings-form';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChoiceChips, type ChipOption } from '@/components/ui/choice-chips';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

const BANKS: readonly ChipOption<string>[] = ['Хаан банк', 'Голомт банк', 'ХасБанк', 'ХХБ', 'Төрийн банк'].map(
  (bank) => ({ value: bank, label: bank }),
);

const TERMS: readonly ChipOption<number | null>[] = [
  { value: null, label: 'Хугацаагүй' },
  ...[3, 6, 12, 18, 24].map((months) => ({ value: months, label: `${months} сар` })),
];

const COMPOUNDING_OPTIONS: readonly SegmentOption<Compounding>[] = (['monthly', 'simple'] as const).map(
  (value) => ({ value, label: COMPOUNDING_LABELS[value] }),
);

type SavingsFormProps = { initial?: SavingsAccount; preset?: SavingsPreset };

export function SavingsForm({ initial, preset }: SavingsFormProps) {
  const form = useSavingsForm(initial, preset);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Дүн (₮)"
          value={form.amountText}
          onChangeText={form.setAmountText}
          placeholder="5,000,000"
          keyboardType="decimal-pad"
          autoFocus={!initial && !preset?.principal}
        />
        <TextField
          label="Жилийн хүү (%)"
          value={form.rateText}
          onChangeText={form.setRateText}
          placeholder="12.5"
          keyboardType="decimal-pad"
        />
        {form.preview ? (
          <Card tone="mint" style={styles.preview}>
            <ThemedText type="small" themeColor="mintInk">
              Өдөрт {formatMoney(Math.round(form.preview.day))} · Сард{' '}
              {formatMoney(Math.round(form.preview.month))} · Жилд{' '}
              {formatMoney(Math.round(form.preview.year))}
            </ThemedText>
          </Card>
        ) : null}

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Хүү бодох арга
          </ThemedText>
          <Segmented
            options={COMPOUNDING_OPTIONS}
            value={form.compounding}
            onChange={form.setCompounding}
            accessibilityLabel="Хүү бодох арга"
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Хугацаа
          </ThemedText>
          <ChoiceChips
            options={TERMS}
            value={form.termMonths}
            onChange={form.setTermMonths}
            accessibilityLabel="Хугацаа"
          />
        </View>

        <DateField label="Эхэлсэн огноо" value={form.startDate} onChange={form.setStartDate} />

        <View style={styles.field}>
          <TextField label="Банк (заавал биш)" value={form.bank} onChangeText={form.setBank} />
          <ChoiceChips options={BANKS} value={form.bank} onChange={form.setBank} accessibilityLabel="Банк" />
        </View>
        <TextField
          label="Нэр (заавал биш)"
          value={form.name}
          onChangeText={form.setName}
          placeholder="Жишээ нь: Хүүхдийн хадгаламж"
          maxLength={60}
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

      <View style={styles.footer}>
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
  content: { padding: Spacing.four, gap: Spacing.four },
  field: { gap: Spacing.two },
  preview: { paddingVertical: Spacing.two },
  footer: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, gap: Spacing.two },
});
