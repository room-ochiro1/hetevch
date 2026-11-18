import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import type { UserListItem } from '@/lib/dal/users';
import { formatCount, formatDateTime } from '@/lib/format';

export function UsersTable({ users }: { users: UserListItem[] }) {
  if (users.length === 0) {
    return <EmptyState title="Хэрэглэгч олдсонгүй" hint="Хайлтын нөхцөлөө өөрчилж үзнэ үү." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-y border-border bg-surface-2/50 text-xs text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Хэрэглэгч</th>
            <th className="px-5 py-3 font-medium">Эрх</th>
            <th className="px-5 py-3 text-right font-medium">Гүйлгээ</th>
            <th className="px-5 py-3 font-medium">Бүртгүүлсэн</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
              <td className="px-5 py-3">
                <Link href={`/users/${user.id}`} className="group block">
                  <span className="block font-medium group-hover:text-accent-text">
                    {user.fullName ?? 'Нэргүй'}
                  </span>
                  <span className="block text-xs text-muted">{user.email ?? '—'}</span>
                </Link>
              </td>
              <td className="px-5 py-3">
                {user.role === 'admin' ? (
                  <Badge tone="accent">Админ</Badge>
                ) : (
                  <Badge>Хэрэглэгч</Badge>
                )}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">{formatCount(user.txCount)}</td>
              <td className="px-5 py-3 text-muted">{formatDateTime(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
