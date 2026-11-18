import type { Compounding, Currency } from '@hetevch/shared';

import { supabase } from '@/lib/supabase';

export type SavingsDraft = {
  name: string;
  icon: string;
  color: string;
  currency: Currency;
  goalAmount: number | null;
  bank: string;
  /** Opening balance on `startDate`. */
  principal: number;
  annualRate: number;
  compounding: Compounding;
  startDate: string;
  termMonths: number | null;
};

const NETWORK_ERROR = 'Интернэт холболтоо шалгаад дахин оролдоно уу.';

/** Inserts (no id) or updates a card; returns a Mongolian error message or null. */
export async function saveSavingsCard(draft: SavingsDraft, id?: string): Promise<string | null> {
  const row = {
    name: draft.name.trim(),
    icon: draft.icon,
    color: draft.color,
    currency: draft.currency,
    goal_amount: draft.goalAmount,
    bank: draft.bank.trim() || null,
    principal: draft.principal,
    annual_rate: draft.annualRate,
    compounding: draft.compounding,
    start_date: draft.startDate,
    term_months: draft.termMonths,
  };
  const { error } = id
    ? await supabase.from('savings_accounts').update(row).eq('id', id)
    : await supabase.from('savings_accounts').insert(row);
  return error ? `Хадгалж чадсангүй. ${NETWORK_ERROR}` : null;
}

/** Deletes a card and, through the foreign key, its whole history. */
export async function deleteSavingsCard(id: string): Promise<string | null> {
  const { error } = await supabase.from('savings_accounts').delete().eq('id', id);
  return error ? `Устгаж чадсангүй. ${NETWORK_ERROR}` : null;
}

export type EntryDraft = {
  accountId: string;
  /** Positive to put money in, negative to take it out (card's currency). */
  amount: number;
  occurredOn: string;
  note: string;
};

export async function addSavingsEntry(draft: EntryDraft): Promise<string | null> {
  const { error } = await supabase.from('savings_entries').insert({
    account_id: draft.accountId,
    amount: draft.amount,
    occurred_on: draft.occurredOn,
    note: draft.note.trim() || null,
  });
  return error ? `Бүртгэж чадсангүй. ${NETWORK_ERROR}` : null;
}

export async function deleteSavingsEntry(id: string): Promise<string | null> {
  const { error } = await supabase.from('savings_entries').delete().eq('id', id);
  return error ? `Устгаж чадсангүй. ${NETWORK_ERROR}` : null;
}
