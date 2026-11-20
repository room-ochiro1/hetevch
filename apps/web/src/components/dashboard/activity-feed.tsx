import { formatMoney } from '@hetevch/shared';
import Link from 'next/link';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { listTransactions } from '@/lib/dal/transactions';
import { listRecentSignups } from '@/lib/dal/users';
import { formatWhen } from '@/lib/format';
import { todayInUlaanbaatar } from '@/lib/range';
import { userName, userSubtitle } from '@/lib/user-label';

type FeedItem = {
  key: string;
  at: string;
  userId: string;
  who: string;
  what: string;
  icon: string;
  badge: { tone: BadgeTone; text: string };
};

/** The latest things that happened in the app, across all users: entries and signups. */
async function loadFeed(limit: number): Promise<FeedItem[]> {
  const [transactions, signups] = await Promise.all([listTransactions({ page: 1 }), listRecentSignups(limit)]);
  const entries: FeedItem[] = transactions.rows.slice(0, limit).flatMap((tx) =>
    tx.user
      ? [
          {
            key: `t${tx.id}`,
            at: tx.createdAt,
            userId: tx.user.id,
            who: tx.user.label,
            what: `${tx.category?.name ?? (tx.kind === 'income' ? 'Орлого' : 'Зарлага')} · ${formatMoney(tx.amount)}`,
            icon: tx.category?.icon ?? '•',
            badge: tx.kind === 'income' ? { tone: 'income', text: 'Орлого' } : { tone: 'expense', text: 'Зарлага' },
          },
        ]
      : [],
  );
  const joined: FeedItem[] = signups.map((user) => ({
    key: `u${user.id}`,
    at: user.createdAt,
    userId: user.id,
    who: userName(user),
    what: `бүртгүүлсэн${userSubtitle(user) ? ` · ${userSubtitle(user)}` : ''}`,
    icon: userName(user).slice(0, 1).toUpperCase(),
    badge: { tone: 'accent', text: 'Шинэ' },
  }));
  return [...entries, ...joined].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export async function ActivityFeed({ limit = 6 }: { limit?: number }) {
  const items = await loadFeed(limit);
  const today = todayInUlaanbaatar();
  if (items.length === 0) return <EmptyState title="Одоохондоо үйл явдал алга" />;

  return (
    <ol className="-mx-2 flex flex-col">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={`/users/${item.userId}`}
            className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface-2"
          >
            <span className="w-12 shrink-0 text-[11px] text-muted tabular-nums">{formatWhen(item.at, today)}</span>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              <span className="font-semibold">{item.who}</span> <span className="text-muted">{item.what}</span>
            </span>
            <Badge tone={item.badge.tone}>{item.badge.text}</Badge>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
