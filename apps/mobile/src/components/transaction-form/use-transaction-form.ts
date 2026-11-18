import {
  formatAmountInput,
  parseAmount,
  toISODate,
  type Category,
  type TransactionKind,
  type TransactionListItem,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

import { deleteTransaction, saveTransaction } from '@/lib/transactions';
import { useFinanceData } from '@/providers/finance-data';

export type FormPreset = { kind?: TransactionKind; categoryId?: string };

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
  const [amountText, setAmountText] = useState(
    initial ? formatAmountInput(String(initial.amount)) : '',
  );
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
    const amount = parseAmount(amountText);
    if (amount === null) {
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
    kind,
    setKind,
    amountText,
    setAmountText,
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
