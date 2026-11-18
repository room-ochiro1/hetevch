import { TRANSACTION_KINDS, type TransactionKind } from '@hetevch/shared';

export type CategoryFields = {
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Validates the editable category fields from a form (kind is handled separately). */
export function parseCategoryFields(formData: FormData): Result<CategoryFields> {
  const name = String(formData.get('name') ?? '').trim();
  const icon = String(formData.get('icon') ?? '').trim();
  const color = String(formData.get('color') ?? '').trim();
  const sortOrder = Number.parseInt(String(formData.get('sortOrder') ?? '0'), 10);

  if (name.length < 1 || name.length > 40) {
    return { ok: false, error: 'Нэр 1–40 тэмдэгт байна.' };
  }
  if ([...icon].length < 1 || [...icon].length > 8) {
    return { ok: false, error: 'Дүрс (emoji) оруулна уу.' };
  }
  if (!HEX_COLOR.test(color)) {
    return { ok: false, error: 'Өнгө буруу байна.' };
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
    return { ok: false, error: 'Эрэмбэ 0–9999 хооронд байна.' };
  }
  return { ok: true, data: { name, icon, color, sortOrder } };
}

export function parseKindField(formData: FormData): TransactionKind | null {
  const kind = formData.get('kind');
  return TRANSACTION_KINDS.find((value) => value === kind) ?? null;
}
