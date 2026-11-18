import { KIND_LABELS, TRANSACTION_KINDS, type TransactionKind } from '@hetevch/shared';
import { router } from 'expo-router';

import type { SegmentOption } from '@/components/ui/segmented';

/** Зарлага / Орлого options for a `Segmented`, colored by their meaning. */
export const KIND_OPTIONS: readonly SegmentOption<TransactionKind>[] = TRANSACTION_KINDS.map(
  (kind) => ({ value: kind, label: KIND_LABELS[kind], tone: kind === 'income' ? 'income' : 'expense' }),
);

type NewTransactionPreset = {
  kind?: TransactionKind;
  categoryId?: string;
  /** Typed on the home keypad, in the display currency ("12500" or "3.5"). */
  amount?: string;
};

/** Opens the add-transaction sheet, optionally with the kind, category or amount filled in. */
export function openNewTransaction(preset?: NewTransactionPreset) {
  const params: Record<string, string> = {};
  if (preset?.kind) params.kind = preset.kind;
  if (preset?.categoryId) params.categoryId = preset.categoryId;
  if (preset?.amount) params.amount = preset.amount;
  router.push({ pathname: '/transaction', params });
}
