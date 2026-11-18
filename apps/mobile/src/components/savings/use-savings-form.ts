import {
  formatAmountInput,
  interestPer,
  parseAmount,
  parseRate,
  toISODate,
  type Compounding,
  type SavingsAccount,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { deleteSavingsAccount, saveSavingsAccount } from '@/lib/savings';
import { useFinanceData } from '@/providers/finance-data';

/** Values carried over from the calculator ("Хадгаламж болгох"). */
export type SavingsPreset = {
  principal?: number;
  annualRate?: number;
  compounding?: Compounding;
  termMonths?: number;
};

/** State and actions of the add/edit savings form; closes the sheet when done. */
export function useSavingsForm(initial?: SavingsAccount, preset?: SavingsPreset) {
  const { invalidate } = useFinanceData();
  const startPrincipal = initial?.principal ?? preset?.principal;
  const startRate = initial?.annual_rate ?? preset?.annualRate;
  const [name, setName] = useState(initial?.name ?? '');
  const [bank, setBank] = useState(initial?.bank ?? '');
  const [amountText, setAmount] = useState(startPrincipal ? formatAmountInput(String(startPrincipal)) : '');
  const [rateText, setRateText] = useState(startRate === undefined ? '' : String(startRate));
  const [compounding, setCompounding] = useState<Compounding>(
    initial?.compounding ?? preset?.compounding ?? 'monthly',
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? toISODate(new Date()));
  const [termMonths, setTermMonths] = useState<number | null>(
    initial ? initial.term_months : (preset?.termMonths ?? 12),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);

  const principal = parseAmount(amountText);
  const annualRate = parseRate(rateText);
  const preview =
    principal !== null && annualRate !== null
      ? interestPer({ principal, annualRate, compounding })
      : null;

  function finish() {
    invalidate();
    router.back();
  }

  async function submit() {
    if (principal === null) {
      setError('Хадгаламжийн дүнгээ зөв оруулна уу. Жишээ нь: 5000000');
      return;
    }
    if (annualRate === null) {
      setError('Жилийн хүүгээ 0-100 хооронд оруулна уу. Жишээ нь: 12.5');
      return;
    }
    setError(null);
    setBusy('saving');
    const saveError = await saveSavingsAccount(
      {
        // The name is optional to keep adding quick; fall back to the bank, then a generic one.
        name: name.trim() || bank.trim() || 'Хадгаламж',
        bank,
        principal,
        annualRate,
        compounding,
        startDate,
        termMonths,
      },
      initial?.id,
    );
    setBusy(null);
    if (saveError) setError(saveError);
    else finish();
  }

  function confirmDelete() {
    const id = initial?.id;
    if (!id) return;
    Alert.alert('Хадгаламжийг устгах уу?', 'Энэ бүртгэлийг сэргээх боломжгүй.', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: async () => {
          setBusy('deleting');
          const deleteError = await deleteSavingsAccount(id);
          setBusy(null);
          if (deleteError) setError(deleteError);
          else finish();
        },
      },
    ]);
  }

  return {
    isEditing: Boolean(initial),
    name,
    setName,
    bank,
    setBank,
    amountText,
    setAmountText: (text: string) => setAmount(formatAmountInput(text)),
    rateText,
    setRateText,
    compounding,
    setCompounding,
    startDate,
    setStartDate,
    termMonths,
    setTermMonths,
    preview,
    error,
    busy,
    submit,
    confirmDelete,
  };
}
