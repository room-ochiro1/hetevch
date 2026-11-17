import { StatCard } from '@/components/admin/stat-card';
import { getUserStats } from '@/lib/dal/users';

export default async function DashboardPage() {
  const stats = await getUserStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Хянах самбар</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Нийт хэрэглэгч" value={stats.total} />
        <StatCard label="Энэ 7 хоногт шинэ" value={stats.newThisWeek} />
        <StatCard label="Админ" value={stats.admins} />
      </div>
    </div>
  );
}
