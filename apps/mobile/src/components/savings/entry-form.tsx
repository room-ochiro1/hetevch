import {
  BASE_CURRENCY,
  CURRENCY_INFO,
  convertAmount,
  formatAmount,
  formatAmountInput,
  parseAmount,
  roundAmount,
  savingsStatus,
  toISODate,
  type Currency,
  type SavingsCard,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DateField } from '@/components/savings/date-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChoiceChips, type ChipOption } from '@/components/ui/choice-chips';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { addSavingsEntry } from '@/lib/savings';
import { useCurrency } from '@/providers/currency';
import { useFinanceData } from '@/providers/finance-data';

export type Direction = 'in' | 'out';

const DIRECTIONS: readonly SegmentOption<Direction>[] = [
  { value: 'in', label: '+ Хийх' },
  { value: 'out', label: '− Авах' },
];

const QUICK: Record<Currency, readonly number[]> = {
  MNT: [10_000, 50_000, 100_000, 500_000],
  USD: [10, 50, 100, 500],
};

/**
 * Put money into a card or take it out. Neither is income or expense, but money put in leaves
 * the user's balance and money taken out comes back to it.
 */
type EntryFormProps = { card: SavingsCard; initialDirection: Direction };

export function EntryForm({ card, initialDirection }: EntryFormProps) {
  const { invalidate } = useFinanceData();
  const { rates } = useCurrency();
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [amountText, setAmountText] = useState('');
  const [occurredOn, setOccurredOn] = useState(toISODate(new Date()));
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const balance = savingsStatus(card, toISODate(new Date())).balance;
  const symbol = CURRENCY_INFO[card.currency].symbol;
  const chips: ChipOption<string>[] = QUICK[card.currency].map((value) => {
    const text = formatAmountInput(String(value));
    return { value: text, label: `${text} ${symbol}` };
  });

  async function submit() {
    const amount = parseAmount(amountText);
    if (amount === null) {
      setError('Дүнгээ зөв оруулна уу.');
      return;
    }
    if (direction === 'out' && amount > balance + 0.005) {
      setError(`Картанд ${formatAmount(balance, card.currency)} байна. Үүнээс их авах боломжгүй.`);
      return;
    }
    // A dollar card's movement also needs its tögrög value, since it moves the user's balance.
    if (card.currency !== BASE_CURRENCY && !rates) {
      setError('Долларын ханш ачаалагдаагүй байна. Интернэтээ шалгаад дахин оролдоно уу.');
      return;
    }
    const signed = direction === 'in' ? amount : -amount;
    const baseAmount =
      card.currency === BASE_CURRENCY || !rates
        ? null
        : roundAmount(convertAmount(signed, card.currency, BASE_CURRENCY, rates.perUsd));
    setError(null);
    setSaving(true);
    const saveError = await addSavingsEntry({
      accountId: card.id,
      amount: signed,
      baseAmount,
      occurredOn,
      note,
    });
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    invalidate();
    router.back();
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Segmented options={DIRECTIONS} value={direction} onChange={setDirection} accessibilityLabel="Хийх эсвэл авах" />
        <ThemedText type="small" themeColor="textSecondary">
          Картанд одоо {formatAmount(balance, card.currency)} байна.
        </ThemedText>
        <TextField
          label={`Дүн (${symbol})`}
          value={amountText}
          onChangeText={(text) => setAmountText(formatAmountInput(text))}
          placeholder="0"
          keyboardType="decimal-pad"
          autoFocus
        />
        <ChoiceChips options={chips} value={amountText} onChange={setAmountText} accessibilityLabel="Түгээмэл дүн" />
        <DateField label="Огноо" value={occurredOn} onChange={setOccurredOn} />
        <TextField
          label="Тэмдэглэл (заавал биш)"
          value={note}
          onChangeText={setNote}
          placeholder={direction === 'in' ? 'Жишээ нь: Цалингаас' : 'Жишээ нь: Тасалбар авсан'}
          maxLength={200}
        />
        <ThemedText type="caption" themeColor="textSecondary">
          {direction === 'in'
            ? 'Хийсэн мөнгө таны үлдэгдлээс хасагдана, зарлагад тооцогдохгүй.'
            : 'Авсан мөнгө таны үлдэгдэлд буцаж нэмэгдэнэ, орлогод тооцогдохгүй.'}
        </ThemedText>
      </ScrollView>
      <View style={styles.footer}>
        {error ? (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        ) : null}
        <Button title={direction === 'in' ? 'Хийх' : 'Авах'} onPress={submit} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  footer: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, gap: Spacing.two },
});
