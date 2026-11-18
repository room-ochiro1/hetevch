import { KIND_LABELS, TRANSACTION_KINDS, type TransactionKind } from '@hetevch/shared';
import { router } from 'expo-router';

import type { SegmentOption } from '@/components/ui/segmented';

/** Зарлага / Орлого options for a `Segmented`, colored by their meaning. */
export const KIND_OPTIONS: readonly SegmentOption<TransactionKind>[] = TRANSACTION_KINDS.map(
  (kind) => ({ value: kind, label: KIND_LABELS[kind], tone: kind === 'income' ? 'income' : 'expense' }),
);

/** Opens the add-transaction sheet, optionally with the kind and category already chosen. */
export function openNewTransaction(preset?: { kind?: TransactionKind; categoryId?: string }) {
  const params: Record<string, string> = {};
  if (preset?.kind) params.kind = preset.kind;
  if (preset?.categoryId) params.categoryId = preset.categoryId;
  router.push({ pathname: '/transaction', params });
}
