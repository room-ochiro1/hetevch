import { formatMoney } from '@hetevch/shared';
import Link from 'next/link';

import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { getTopUsers } from '@/lib/dal/analytics';
import { formatCount, formatDateTime } from '@/lib/format';
import type { RangeDays } from '@/lib/range';

/** Who uses the app most in the period: count with an inline bar, spend, last activity. */
export async function TopUsersPanel({ days }: { days: RangeDays }) {
  const users = await getTopUsers(days);
  const max = Math.max(1, ...users.map((u) => u.txCount));

  return (
    <Panel title="Хамгийн идэвхтэй хэрэглэгчид" description={`Бүртгэсэн гүйлгээгээр · сүүлийн ${days} хоног`} flush>
      {users.length === 0 ? (
        <EmptyState title="Энэ хугацаанд идэвхтэй хэрэглэгч алга" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-border text-xs text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Хэрэглэгч</th>
                <th className="px-5 py-2.5 font-medium">Гүйлгээ</th>
                <th className="px-5 py-2.5 text-right font-medium">Зарлага</th>
                <th className="px-5 py-2.5 font-medium">Сүүлд</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                  <td className="px-5 py-3">
                    <Link href={`/users/${user.id}`} className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text uppercase">
                        {user.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium hover:underline">{user.name}</span>
                        <span className="block truncate text-xs text-muted">{user.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right font-semibold tabular-nums">{formatCount(user.txCount)}</span>
                      <span className="h-1.5 w-20 rounded-full bg-surface-2">
                        <span
                          className="block h-full rounded-full bg-chart-1"
                          style={{ width: `${(user.txCount / max) * 100}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums whitespace-nowrap">{formatMoney(user.expense)}</td>
                  <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">{formatDateTime(user.lastActive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
