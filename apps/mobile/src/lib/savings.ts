import type { Compounding } from '@hetevch/shared';

import { supabase } from '@/lib/supabase';

export type SavingsDraft = {
  name: string;
  bank: string;
  principal: number;
  annualRate: number;
  compounding: Compounding;
  startDate: string;
  termMonths: number | null;
};

/** Inserts (no id) or updates a savings account; returns a Mongolian error message or null. */
export async function saveSavingsAccount(draft: SavingsDraft, id?: string): Promise<string | null> {
  const row = {
    name: draft.name.trim(),
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
  return error ? 'Хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.' : null;
}

export async function deleteSavingsAccount(id: string): Promise<string | null> {
  const { error } = await supabase.from('savings_accounts').delete().eq('id', id);
  return error ? 'Устгаж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.' : null;
}
