import { listUsers } from '@/lib/dal/users';

const dateFormat = new Intl.DateTimeFormat('mn-MN', { dateStyle: 'medium' });

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Хэрэглэгчид</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Нэр</th>
              <th className="px-4 py-3 font-medium">Имэйл</th>
              <th className="px-4 py-3 font-medium">Эрх</th>
              <th className="px-4 py-3 font-medium">Бүртгүүлсэн</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{user.full_name ?? '—'}</td>
                <td className="px-4 py-3">{user.email ?? '—'}</td>
                <td className="px-4 py-3">{user.role === 'admin' ? 'Админ' : 'Хэрэглэгч'}</td>
                <td className="px-4 py-3 tabular-nums">
                  {dateFormat.format(new Date(user.created_at))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Хэрэглэгч алга байна.</p>
        ) : null}
      </div>
    </div>
  );
}
