import {
  COMPOUNDING_LABELS,
  CURRENCY_INFO,
  formatAmountInput,
  toCardCurrency,
  type Compounding,
  type Currency,
} from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { CalculatorResults } from '@/components/savings/calculator-results';
import {
  DURATION_PRESETS,
  useCalculator,
  type DurationUnit,
} from '@/components/savings/use-calculator';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChips, type ChipOption } from '@/components/ui/choice-chips';
import { Page } from '@/components/ui/page';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';

const UNITS: readonly SegmentOption<DurationUnit>[] = [
  { value: 'day', label: 'Өдөр' },
  { value: 'month', label: 'Сар' },
  { value: 'year', label: 'Жил' },
];

const AMOUNTS: Record<Currency, readonly ChipOption<string>[]> = {
  MNT: [1, 5, 10, 50].map((millions) => ({
    value: formatAmountInput(String(millions * 1_000_000)),
    label: `${millions} сая`,
  })),
  USD: [1000, 5000, 10000, 50000].map((dollars) => ({
    value: formatAmountInput(String(dollars)),
    label: '$' + formatAmountInput(String(dollars)),
  })),
};

const COMPOUNDING_OPTIONS: readonly SegmentOption<Compounding>[] = (['monthly', 'simple'] as const).map(
  (value) => ({ value, label: COMPOUNDING_LABELS[value] }),
);

const UNIT_WORD: Record<DurationUnit, string> = { day: 'хоног', month: 'сар', year: 'жил' };

/** "How much will my savings earn?" — amount, rate and time in; the answer updates as you type. */
export default function CalculatorScreen() {
  const calc = useCalculator();
  // Cards are held in tögrög or dollars, so the calculator uses the display currency only then.
  const currency = toCardCurrency(useMoney().currency);
  const symbol = CURRENCY_INFO[currency].symbol;

  return (
    <Page>
      <View style={styles.field}>
        <TextField
          label={`Хадгалах дүн (${symbol})`}
          value={calc.amountText}
          onChangeText={calc.setAmountText}
          placeholder="5,000,000"
          keyboardType="decimal-pad"
        />
        <ChoiceChips
          options={AMOUNTS[currency]}
          value={calc.amountText}
          onChange={calc.setAmountText}
          accessibilityLabel="Түгээмэл дүн"
        />
      </View>

      <TextField
        label="Жилийн хүү (%)"
        value={calc.rateText}
        onChangeText={calc.setRateText}
        placeholder="12.5"
        keyboardType="decimal-pad"
      />

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Хугацаа
        </ThemedText>
        <Segmented options={UNITS} value={calc.unit} onChange={calc.setUnit} accessibilityLabel="Хугацааны нэгж" />
        <ChoiceChips
          options={DURATION_PRESETS[calc.unit].map((n) => ({
            value: String(n),
            label: `${n} ${UNIT_WORD[calc.unit]}`,
          }))}
          value={calc.durationText}
          onChange={calc.setDurationText}
          accessibilityLabel="Түгээмэл хугацаа"
        />
        <TextField
          label={`Өөр хугацаа (${UNIT_WORD[calc.unit]})`}
          value={calc.durationText}
          onChangeText={calc.setDurationText}
          keyboardType="number-pad"
          maxLength={5}
        />
        {calc.durationError ? (
          <ThemedText type="small" themeColor="danger">
            Хугацаагаа зөв оруулна уу.
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Хүү бодох арга
        </ThemedText>
        <Segmented
          options={COMPOUNDING_OPTIONS}
          value={calc.compounding}
          onChange={calc.setCompounding}
          accessibilityLabel="Хүү бодох арга"
        />
        <ThemedText type="caption" themeColor="textSecondary">
          {calc.compounding === 'monthly'
            ? 'Сар бүрийн хүү хадгаламж дээр нэмэгдэж, дараагийн сард хүү нь хүү бүтээнэ.'
            : 'Хүүг зөвхөн анхны дүнгээс бодно (сар бүр гарт авдаг хүү).'}
        </ThemedText>
      </View>

      {calc.result ? (
        <CalculatorResults result={calc.result} currency={currency} />
      ) : (
        <StateMessage
          icon="🧮"
          title="Дүн, хүүгээ оруулна уу"
          body="Хэдэн төгрөгийг хэдэн хувийн хүүтэй хадгалахаа бичихэд үр дүн шууд гарна."
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
});
