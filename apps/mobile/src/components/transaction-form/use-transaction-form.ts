import {
  formatAmount,
  formatAmountInput,
  parseAmount,
  roundAmount,
  toISODate,
  type Category,
  type TransactionKind,
  type TransactionListItem,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

import { useMoney } from '@/hooks/use-money';
import { deleteTransaction, saveTransaction } from '@/lib/transactions';
import { useFinanceData } from '@/providers/finance-data';

export type FormPreset = {
  kind?: TransactionKind;
  categoryId?: string;
  /** Amount typed on the home keypad, in the display currency. */
  amount?: string;
};

type Options = {
  /** The transaction being edited; undefined when adding a new one. */
  initial?: TransactionListItem;
  preset?: FormPreset;
  categories: readonly Category[];
};

/** State and actions of the add/edit transaction form. Closes the sheet when done. */
export function useTransactionForm({ initial, preset, categories }: Options) {
  const { invalidate } = useFinanceData();
  const startKind = initial?.kind ?? preset?.kind ?? 'expense';
  // Only trust a preset category that exists and matches the kind (the URL is just a hint).
  const presetCategory = categories.some((c) => c.id === preset?.categoryId && c.kind === startKind)
    ? (preset?.categoryId ?? null)
    : null;
  const [kind, setKindState] = useState<TransactionKind>(startKind);
  const money = useMoney();
  // Amounts are typed in the display currency and stored in tögrög.
  const [initialText] = useState(() =>
    initial ? formatAmountInput(String(roundAmount(money.convert(initial.amount) ?? initial.amount))) : '',
  );
  const [amountText, setAmountText] = useState(
    initialText || (preset?.amount ? formatAmountInput(preset.amount) : ''),
  );
  const typed = parseAmount(amountText);
  const amountHint =
    money.currency !== 'MNT' && typed !== null
      ? `≈ ${formatAmount(Math.round(money.toBase(typed)), 'MNT')}`
      : undefined;
  const [categoryId, setCategoryIdState] = useState<string | null>(
    initial?.category_id ?? presetCategory,
  );
  const [note, setNote] = useState(initial?.note ?? '');
  const [occurredOn, setOccurredOn] = useState(initial?.occurred_on ?? toISODate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);

  const visibleCategories = categories.filter((category) => category.kind === kind);

  /** Picking a category means the amount is done: close the keyboard so "Нэмэх" is in view. */
  function setCategoryId(id: string | null) {
    Keyboard.dismiss();
    setCategoryIdState(id);
  }

  function setKind(next: TransactionKind) {
    setKindState(next);
    // A category belongs to one kind; keep the choice only if it still fits.
    if (!categories.some((category) => category.id === categoryId && category.kind === next)) {
      setCategoryId(null);
    }
  }

  function finish() {
    invalidate();
    router.back();
  }

  async function submit() {
    // Untouched while editing: keep the stored tögrög exactly (no round trip through the rate).
    const amount =
      initial && amountText === initialText ? initial.amount : typed && money.toBase(typed);
    if (!amount) {
      setError('Дүнгээ зөв оруулна уу. Жишээ нь: 12500');
      return;
    }
    if (!categoryId) {
      setError('Ангилал сонгоно уу.');
      return;
    }
    setError(null);
    setBusy('saving');
    const saveError = await saveTransaction(
      { kind, amount, categoryId, note, occurredOn },
      initial?.id,
    );
    setBusy(null);
    if (saveError) setError(saveError);
    else finish();
  }

  function confirmDelete() {
    const id = initial?.id;
    if (!id) return;
    Alert.alert('Гүйлгээг устгах уу?', 'Устгасан гүйлгээг сэргээх боломжгүй.', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: async () => {
          setBusy('deleting');
          const deleteError = await deleteTransaction(id);
          setBusy(null);
          if (deleteError) setError(deleteError);
          else finish();
        },
      },
    ]);
  }

  return {
    isEditing: Boolean(initial),
    /** The amount came from the keypad: open on the categories, not the keyboard. */
    hasPresetAmount: Boolean(preset?.amount),
    kind,
    setKind,
    amountText,
    setAmountText,
    amountHint,
    currency: money.currency,
    categoryId,
    setCategoryId,
    visibleCategories,
    note,
    setNote,
    occurredOn,
    setOccurredOn,
    error,
    busy,
    submit,
    confirmDelete,
  };
}
