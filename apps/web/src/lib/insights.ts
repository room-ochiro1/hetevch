import type { TransactionKind } from '@hetevch/shared';

import { changeRatio, formatCompactMoney } from '@/lib/chart-scale';
import type { Dashboard } from '@/lib/dal/analytics';
import type { AdminCategory, UserCategory } from '@/lib/dal/categories';
import type { CategoryTotal } from '@/lib/dal/overview';
import type { Detail } from '@/lib/filters';
import { formatCount, formatShortDay } from '@/lib/format';
import { weekdayName } from '@/lib/greeting';

/*
 * "Анхаарах зүйлс": a few things worth the admin's attention, derived from data the dashboard
 * already loads. Pure, so the rules are easy to read and change.
 */

/** A category several users made for themselves that the built-in list doesn't have yet. */
export type Candidate = { kind: TransactionKind; name: string; icon: string; color: string; owners: number; txCount: number };

export type Insight = {
  key: string;
  icon: string;
  tone: 'warn' | 'income' | 'expense' | 'accent';
  title: string;
  subtitle: string;
  /** The number behind it, e.g. "2.1 сая ₮ → 2.5 сая ₮". */
  chip: string;
  ring: { ratio: number; text: string };
  secondary?: { label: string; href: string };
  primary: { label: string; href: string } | { promote: Candidate };
};

const norm = (name: string) => name.trim().toLowerCase();

export function promoteCandidates(own: UserCategory[], builtIn: AdminCategory[]): Candidate[] {
  const taken = new Set(builtIn.map((c) => `${c.kind}:${norm(c.name)}`));
  const groups = new Map<string, Candidate & { ownerIds: Set<string> }>();
  for (const category of own) {
    const key = `${category.kind}:${norm(category.name)}`;
    if (taken.has(key)) continue;
    const { kind, icon, color } = category;
    const group = groups.get(key) ?? { kind, icon, color, name: category.name.trim(), owners: 0, txCount: 0, ownerIds: new Set<string>() };
    group.ownerIds.add(category.owner?.id ?? category.id);
    group.txCount += category.txCount;
    groups.set(key, group);
  }
  return [...groups.values()]
    .map(({ ownerIds, ...group }) => ({ ...group, owners: ownerIds.size }))
    .filter((group) => group.owners >= 2 || group.txCount >= 10)
    .sort((a, b) => b.owners - a.owners || b.txCount - a.txCount);
}

type Input = {
  dashboard: Dashboard;
  days: number;
  topExpense: CategoryTotal[];
  candidates: Candidate[];
  link: (detail: Detail) => string;
};

export function buildInsights({ dashboard, days, topExpense, candidates, link }: Input): Insight[] {
  const { current, previous, daily, totalUsers } = dashboard;
  const insights: Insight[] = [];
  const expenseLink = link({ type: 'kind', kind: 'expense' });

  const change = changeRatio(current.expense, previous.expense);
  const peak = daily.reduce<(typeof daily)[number] | null>((best, d) => (!best || d.expense > best.expense ? d : best), null);
  if (change !== null && Math.abs(change) >= 0.1) {
    const pct = Math.round(Math.abs(change) * 100);
    insights.push({
      key: 'expense-change',
      icon: change > 0 ? '📈' : '📉',
      tone: change > 0 ? 'warn' : 'income',
      title: `Зарлага ${pct}% ${change > 0 ? 'өссөн' : 'буурсан'}`,
      subtitle: `Өмнөх ${days} хоногтой харьцуулахад`,
      chip: `${formatCompactMoney(previous.expense)} → ${formatCompactMoney(current.expense)}`,
      ring: { ratio: Math.min(1, Math.abs(change)), text: `${pct}%` },
      secondary: peak && peak.expense > 0 ? { label: 'Оргил өдөр', href: link({ type: 'day', day: peak.day }) } : undefined,
      primary: { label: 'Задлах', href: expenseLink },
    });
  }

  const top = topExpense[0];
  const share = top && current.expense > 0 ? top.total / current.expense : 0;
  if (top && share >= 0.2) {
    insights.push({
      key: 'top-category',
      icon: top.icon,
      tone: 'expense',
      title: `«${top.name}» зарлагын ${Math.round(share * 100)}%`,
      subtitle: `${formatCount(top.txCount)} гүйлгээ · хамгийн том зарлага`,
      chip: formatCompactMoney(top.total),
      ring: { ratio: share, text: `${Math.round(share * 100)}%` },
      secondary: { label: 'Бүх ангилал', href: expenseLink },
      primary: { label: 'Харах', href: link({ type: 'category', id: top.categoryId, band: null }) },
    });
  }

  const candidate = candidates[0];
  if (candidate) {
    insights.push({
      key: `promote-${candidate.kind}-${norm(candidate.name)}`,
      icon: candidate.icon,
      tone: 'accent',
      title: `«${candidate.name}» ангиллыг ${candidate.owners} хэрэглэгч нэмсэн`,
      subtitle: 'Нийтийн ангилалд нэмбэл бүх хэрэглэгчид харагдана',
      chip: `${candidate.kind === 'income' ? 'Орлого' : 'Зарлага'} · ${formatCount(candidate.txCount)} гүйлгээ`,
      ring: { ratio: Math.min(1, candidate.owners / 5), text: `${candidate.owners} хүн` },
      secondary: { label: 'Жагсаалт', href: '/categories' },
      primary: { promote: candidate },
    });
  }

  if (current.newUsers > 0) {
    insights.push({
      key: 'new-users',
      icon: '👋',
      tone: 'accent',
      title: `${formatCount(current.newUsers)} шинэ хэрэглэгч нэгдсэн`,
      subtitle: `Сүүлийн ${days} хоногт · нийт ${formatCount(totalUsers)}`,
      chip: `Өмнөх үед ${formatCount(previous.newUsers)}`,
      ring: { ratio: totalUsers > 0 ? current.newUsers / totalUsers : 0, text: `${formatCount(current.newUsers)}` },
      secondary: { label: 'Насаар', href: link({ type: 'bands' }) },
      primary: { label: 'Харах', href: '/users' },
    });
  }

  const average = current.expense / Math.max(1, daily.length);
  if (peak && average > 0 && peak.expense >= average * 2.5) {
    insights.push({
      key: 'peak-day',
      icon: '📅',
      tone: 'warn',
      title: `${formatShortDay(peak.day)}-нд зарлага оргилсон`,
      subtitle: `${weekdayName(peak.day)} · өдрийн дунджаас ${(peak.expense / average).toFixed(1)} дахин их`,
      chip: formatCompactMoney(peak.expense),
      ring: { ratio: Math.min(1, average / peak.expense), text: `×${(peak.expense / average).toFixed(1)}` },
      primary: { label: 'Өдрийг задлах', href: link({ type: 'day', day: peak.day }) },
    });
  }

  return insights.slice(0, 4);
}
