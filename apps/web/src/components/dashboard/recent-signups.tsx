import Link from 'next/link';

import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { listRecentSignups } from '@/lib/dal/users';
import { formatDateTime } from '@/lib/format';

export async function RecentSignups() {
  const users = await listRecentSignups(6);

  return (
    <Panel
      title="Сүүлд бүртгүүлсэн"
      action={
        <Link href="/users" className="text-sm font-medium text-accent-text hover:underline">
          Бүгдийг харах
        </Link>
      }
    >
      {users.length === 0 ? (
        <EmptyState title="Хэрэглэгч алга байна" />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {users.map((user) => {
            const name = user.full_name ?? user.email ?? 'Нэргүй';
            return (
              <li key={user.id}>
                <Link
                  href={`/users/${user.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text uppercase">
                    {name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{name}</span>
                    <span className="block truncate text-xs text-muted">{user.email}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDateTime(user.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
