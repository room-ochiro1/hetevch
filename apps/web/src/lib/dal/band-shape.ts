import type { AgeBand } from '@/lib/age-bands';
import { person, ranked, type PersonRef, type Ranked } from '@/lib/dal/detail-shapes';
import { list, num, obj, text } from '@/lib/json-read';

/** Shape of admin_band_detail (supabase/migrations/*_admin_details.sql). */
export type BandDetail = {
  band: AgeBand;
  users: number;
  newUsers: number;
  activeUsers: number;
  income: number;
  expense: number;
  txCount: number;
  topExpense: (Ranked & { users: number })[];
  topIncome: Ranked[];
  weekday: { weekday: number; expense: number; txCount: number }[];
  savings: { savers: number; cards: number; savedMnt: number; savedUsd: number; goalMnt: number };
  purposes: { icon: string; cards: number; savers: number; savedMnt: number; savedUsd: number; goalMnt: number }[];
  topUsers: (PersonRef & { income: number; expense: number; txCount: number })[];
};

export function toBandDetail(data: unknown, band: AgeBand): BandDetail {
  const root = obj(data);
  const savings = obj(root.savings);
  return {
    band,
    users: num(root.users),
    newUsers: num(root.new_users),
    activeUsers: num(root.active_users),
    income: num(root.income),
    expense: num(root.expense),
    txCount: num(root.tx_count),
    topExpense: list(root.top_expense).map((r) => ({ ...ranked(r), users: num(r.users) })),
    topIncome: list(root.top_income).map(ranked),
    weekday: list(root.weekday).map((r) => ({
      weekday: num(r.weekday),
      expense: num(r.expense),
      txCount: num(r.tx_count),
    })),
    savings: {
      savers: num(savings.savers),
      cards: num(savings.cards),
      savedMnt: num(savings.saved_mnt),
      savedUsd: num(savings.saved_usd),
      goalMnt: num(savings.goal_mnt),
    },
    purposes: list(root.purposes).map((r) => ({
      icon: text(r.icon, '🐷'),
      cards: num(r.cards),
      savers: num(r.savers),
      savedMnt: num(r.saved_mnt),
      savedUsd: num(r.saved_usd),
      goalMnt: num(r.goal_mnt),
    })),
    topUsers: list(root.top_users).map((r) => ({
      ...person(r),
      income: num(r.income),
      expense: num(r.expense),
      txCount: num(r.tx_count),
    })),
  };
}
