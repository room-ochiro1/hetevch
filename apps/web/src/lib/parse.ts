import type { TransactionKind } from '@hetevch/shared';

/** Narrows a query-string value to a transaction kind. */
export function parseKind(value: string | undefined): TransactionKind | undefined {
  return value === 'income' || value === 'expense' ? value : undefined;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}
