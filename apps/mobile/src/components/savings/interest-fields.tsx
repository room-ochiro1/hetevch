import {
  COMPOUNDING_LABELS,
  CURRENCY_INFO,
  formatAmount,
  interestPer,
  type Compounding,
  type Currency,
} from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { DateField } from '@/components/savings/date-field';
import type { SavingsFormState } from '@/components/savings/use-savings-form';
import { ThemedText } from '@/components/themed-text';
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

type InterestFieldsProps = {
  interest: SavingsFormState['interest'];
  values: SavingsFormState['values'];
  currency: Currency;
};

/**
 * Opening balance and, only for a bank deposit, its interest terms: the extra fields appear once
 * a rate is typed, so a simple pot stays a two-field form.
 */
export function InterestFields({ interest, values, currency }: InterestFieldsProps) {
  const symbol = CURRENCY_INFO[currency].symbol;
  const hasRate = values.annualRate > 0;
  const per = interestPer({
    principal: values.principal,
    annualRate: values.annualRate,
    compounding: interest.compounding,
  });

  return (
    <View style={styles.section}>
      <TextField
        label={`Одоо байгаа дүн (${symbol})`}
        value={interest.principalText}
        onChangeText={interest.setPrincipalText}
        placeholder="0"
        keyboardType="decimal-pad"
      />
      <TextField
        label="Жилийн хүү (%, банкны хадгаламж бол)"
        value={interest.rateText}
        onChangeText={interest.setRateText}
        placeholder="Жишээ нь: 12.5"
        keyboardType="decimal-pad"
      />

      {hasRate ? (
        <>
          {values.principal > 0 ? (
            <Card tone="mint" style={styles.preview}>
              <ThemedText type="small" themeColor="mintInk">
                Өдөрт {formatAmount(per.day, currency)} · Сард {formatAmount(per.month, currency)} ·
                Жилд {formatAmount(per.year, currency)}
              </ThemedText>
            </Card>
          ) : null}
          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Хүү бодох арга
            </ThemedText>
            <Segmented
              options={COMPOUNDING_OPTIONS}
              value={interest.compounding}
              onChange={interest.setCompounding}
              accessibilityLabel="Хүү бодох арга"
            />
          </View>
          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Хугацаа
            </ThemedText>
            <ChoiceChips
              options={TERMS}
              value={interest.termMonths}
              onChange={interest.setTermMonths}
              accessibilityLabel="Хугацаа"
            />
          </View>
          <DateField label="Эхэлсэн огноо" value={interest.startDate} onChange={interest.setStartDate} />
          <View style={styles.field}>
            <TextField label="Банк (заавал биш)" value={interest.bank} onChangeText={interest.setBank} />
            <ChoiceChips
              options={BANKS}
              value={interest.bank}
              onChange={interest.setBank}
              accessibilityLabel="Банк"
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.four },
  field: { gap: Spacing.two },
  preview: { paddingVertical: Spacing.two },
});
