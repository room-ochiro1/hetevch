import { toAgeBand, type AgeBand } from '@/lib/age-bands';
import { list, num, numOrNull, obj, text, textOrNull, type JsonObject } from '@/lib/json-read';

/** Shapes of the admin_*_detail RPCs (supabase/migrations/*_admin_details.sql). */

type Kind = 'income' | 'expense';
export type PersonRef = { userId: string; name: string; birthYear: number | null };

export type CategoryDetail = {
  category: { id: string; name: string; icon: string; color: string; kind: Kind };
  totals: { amount: number; txCount: number; users: number };
  byBand: { band: AgeBand; amount: number; txCount: number; users: number }[];
  daily: { day: string; amount: number }[];
  topUsers: (PersonRef & { amount: number; txCount: number })[];
  recent: (PersonRef & { id: string; occurredOn: string; amount: number; note: string | null })[];
};

export type DayDetail = {
  day: string;
  totals: { income: number; expense: number; txCount: number; users: number };
  newUsers: number;
  categories: { id: string | null; name: string; icon: string; kind: Kind; amount: number; txCount: number }[];
  transactions: (PersonRef & {
    id: string;
    kind: Kind;
    amount: number;
    note: string | null;
    createdAt: string;
    category: string | null;
    icon: string | null;
  })[];
};

export type Ranked = { id: string; name: string; icon: string; amount: number; txCount: number };

export const kind = (value: unknown): Kind => (value === 'income' ? 'income' : 'expense');

export function person(row: JsonObject): PersonRef {
  return { userId: text(row.user_id), name: text(row.name, 'Нэргүй'), birthYear: numOrNull(row.birth_year) };
}

export function ranked(row: JsonObject): Ranked {
  return {
    id: text(row.id),
    name: text(row.name, 'Ангилалгүй'),
    icon: text(row.icon, '❔'),
    amount: num(row.amount),
    txCount: num(row.tx_count),
  };
}

/** Null when the RPC returned nothing (not an admin) or the category doesn't exist. */
export function toCategoryDetail(data: unknown): CategoryDetail | null {
  const root = obj(data);
  const category = obj(root.category);
  if (!category.id) return null;
  const totals = obj(root.totals);
  return {
    category: {
      id: text(category.id),
      name: text(category.name),
      icon: text(category.icon, '❔'),
      color: text(category.color, '#64748B'),
      kind: kind(category.kind),
    },
    totals: { amount: num(totals.amount), txCount: num(totals.tx_count), users: num(totals.users) },
    byBand: list(root.by_band).map((r) => ({
      band: toAgeBand(text(r.band)),
      amount: num(r.amount),
      txCount: num(r.tx_count),
      users: num(r.users),
    })),
    daily: list(root.daily).map((r) => ({ day: text(r.day), amount: num(r.amount) })),
    topUsers: list(root.top_users).map((r) => ({ ...person(r), amount: num(r.amount), txCount: num(r.tx_count) })),
    recent: list(root.recent).map((r) => ({
      ...person(r),
      id: text(r.id),
      occurredOn: text(r.occurred_on),
      amount: num(r.amount),
      note: textOrNull(r.note),
    })),
  };
}

export function toDayDetail(data: unknown): DayDetail {
  const root = obj(data);
  const totals = obj(root.totals);
  return {
    day: text(root.day),
    totals: {
      income: num(totals.income),
      expense: num(totals.expense),
      txCount: num(totals.tx_count),
      users: num(totals.users),
    },
    newUsers: num(root.new_users),
    categories: list(root.categories).map((r) => ({ ...ranked(r), id: textOrNull(r.id), kind: kind(r.kind) })),
    transactions: list(root.transactions).map((r) => ({
      ...person(r),
      id: text(r.id),
      kind: kind(r.kind),
      amount: num(r.amount),
      note: textOrNull(r.note),
      createdAt: text(r.created_at),
      category: textOrNull(r.category),
      icon: textOrNull(r.icon),
    })),
  };
}
