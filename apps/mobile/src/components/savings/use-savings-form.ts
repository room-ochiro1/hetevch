import {
  formatAmountInput,
  parseAmount,
  parseRate,
  toISODate,
  type Compounding,
  type Currency,
  type SavingsCard,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { CARD_ICONS, type CardColor } from '@/constants/savings-appearance';
import { useMoney } from '@/hooks/use-money';
import { deleteSavingsCard, saveSavingsCard } from '@/lib/savings';
import { useFinanceData } from '@/providers/finance-data';

/** Values carried over from the calculator ("Хадгаламж болгох"). */
export type SavingsPreset = {
  principal?: number;
  annualRate?: number;
  compounding?: Compounding;
  termMonths?: number;
  currency?: Currency;
};

const amountText = (value: number | null | undefined) =>
  value ? formatAmountInput(String(value)) : '';

/** State and actions of the add/edit card form; closes the sheet when done. */
export function useSavingsForm(initial?: SavingsCard, preset?: SavingsPreset) {
  const { invalidate } = useFinanceData();
  const displayCurrency = useMoney().currency;
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? CARD_ICONS[0]);
  const [color, setColor] = useState<string>(initial?.color ?? ('indigo' satisfies CardColor));
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? preset?.currency ?? displayCurrency);
  const [goalText, setGoalText] = useState(amountText(initial?.goal_amount));
  const [principalText, setPrincipalText] = useState(amountText(initial?.principal ?? preset?.principal));
  const startRate = initial?.annual_rate ?? preset?.annualRate;
  const [rateText, setRateText] = useState(startRate ? String(startRate) : '');
  const [compounding, setCompounding] = useState<Compounding>(
    initial?.compounding ?? preset?.compounding ?? 'monthly',
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? toISODate(new Date()));
  const [termMonths, setTermMonths] = useState<number | null>(
    initial ? initial.term_months : (preset?.termMonths ?? null),
  );
  const [bank, setBank] = useState(initial?.bank ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);

  // Empty means "none": a new pot may start at zero and earn no interest.
  const principal = principalText.trim() ? parseAmount(principalText) : 0;
  const annualRate = rateText.trim() ? parseRate(rateText) : 0;
  const goalAmount = goalText.trim() ? parseAmount(goalText) : null;

  function finish() {
    invalidate();
    router.back();
  }

  async function submit() {
    const problem = !name.trim()
      ? 'Картын нэрээ бичнэ үү. Жишээ нь: Аяллын мөнгө'
      : principal === null
        ? 'Одоо байгаа дүнгээ зөв оруулна уу. Жишээ нь: 500000'
        : annualRate === null
          ? 'Жилийн хүүгээ 0-100 хооронд оруулна уу. Жишээ нь: 12.5'
          : goalText.trim() && goalAmount === null
            ? 'Зорилгын дүнгээ зөв оруулна уу.'
            : null;
    if (problem || principal === null || annualRate === null) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy('saving');
    const saveError = await saveSavingsCard(
      { name, icon, color, currency, goalAmount, bank, principal, annualRate, compounding, startDate, termMonths },
      initial?.id,
    );
    setBusy(null);
    if (saveError) setError(saveError);
    else finish();
  }

  function confirmDelete() {
    const id = initial?.id;
    if (!id) return;
    Alert.alert('Картыг устгах уу?', 'Карт болон түүний бүх гүйлгээ устах ба сэргээх боломжгүй.', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: async () => {
          setBusy('deleting');
          const deleteError = await deleteSavingsCard(id);
          setBusy(null);
          if (deleteError) setError(deleteError);
          // The card's own screen is underneath: go all the way back to the tabs.
          else {
            invalidate();
            router.dismissAll();
          }
        },
      },
    ]);
  }

  const format = (setter: (text: string) => void) => (text: string) => setter(formatAmountInput(text));

  return {
    isEditing: Boolean(initial),
    card: { name, setName, icon, setIcon, color, setColor, currency, setCurrency, goalText, setGoalText: format(setGoalText) },
    interest: {
      principalText,
      setPrincipalText: format(setPrincipalText),
      rateText,
      setRateText,
      compounding,
      setCompounding,
      startDate,
      setStartDate,
      termMonths,
      setTermMonths,
      bank,
      setBank,
    },
    values: { principal: principal ?? 0, annualRate: annualRate ?? 0, goalAmount },
    error,
    busy,
    submit,
    confirmDelete,
  };
}

export type SavingsFormState = ReturnType<typeof useSavingsForm>;
