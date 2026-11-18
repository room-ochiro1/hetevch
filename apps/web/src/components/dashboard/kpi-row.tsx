import { formatMoney } from '@hetevch/shared';

import { KpiTile, KpiTileSkeleton } from '@/components/dashboard/kpi-tile';
import { ActivityIcon, ReceiptIcon, TrendDownIcon, UserPlusIcon } from '@/components/ui/icons';
import { getDashboard } from '@/lib/dal/analytics';
import { formatCount } from '@/lib/format';
import type { RangeDays } from '@/lib/range';

export async function KpiRow({ days }: { days: RangeDays }) {
  const { totalUsers, daily, current, previous } = await getDashboard(days);
  const versus = `өмнөх ${days} хоногоос`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiTile
        icon={UserPlusIcon}
        label="Шинэ хэрэглэгч"
        value={formatCount(current.newUsers)}
        current={current.newUsers}
        previous={previous.newUsers}
        versus={`${versus} · нийт ${formatCount(totalUsers)}`}
        trend={daily.map((d) => d.newUsers)}
      />
      <KpiTile
        icon={ActivityIcon}
        label="Идэвхтэй хэрэглэгч"
        value={formatCount(current.activeUsers)}
        current={current.activeUsers}
        previous={previous.activeUsers}
        versus={versus}
        trend={daily.map((d) => d.activeUsers)}
      />
      <KpiTile
        icon={ReceiptIcon}
        label="Гүйлгээ"
        value={formatCount(current.txCount)}
        current={current.txCount}
        previous={previous.txCount}
        versus={versus}
        trend={daily.map((d) => d.txCount)}
      />
      <KpiTile
        icon={TrendDownIcon}
        label="Нийт зарлага"
        value={formatMoney(current.expense)}
        current={current.expense}
        previous={previous.expense}
        versus={versus}
        polarity="neutral"
        trend={daily.map((d) => d.expense)}
      />
    </div>
  );
}

export function KpiRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <KpiTileSkeleton key={i} />
      ))}
    </div>
  );
}
