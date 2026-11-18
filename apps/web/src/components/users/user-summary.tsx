import { formatMoney } from '@hetevch/shared';

import { StatCard } from '@/components/admin/stat-card';
import { ReceiptIcon, TrendDownIcon, TrendUpIcon, WalletIcon } from '@/components/ui/icons';
import type { UserDetail } from '@/lib/dal/user-detail';
import { formatCount, formatDay } from '@/lib/format';

export function UserSummary({ summary }: { summary: UserDetail['summary'] }) {
  const net = summary.income - summary.expense;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={ReceiptIcon}
        label="Гүйлгээ"
        value={formatCount(summary.txCount)}
        hint={
          summary.lastOccurredOn
            ? `Сүүлийнх: ${formatDay(summary.lastOccurredOn)}`
            : 'Гүйлгээ бүртгээгүй'
        }
      />
      <StatCard icon={TrendUpIcon} tone="income" label="Нийт орлого" value={formatMoney(summary.income)} />
      <StatCard
        icon={TrendDownIcon}
        tone="expense"
        label="Нийт зарлага"
        value={formatMoney(summary.expense)}
      />
      <StatCard
        icon={WalletIcon}
        tone={net < 0 ? 'expense' : 'income'}
        label="Үлдэгдэл"
        value={`${net < 0 ? '−' : ''}${formatMoney(Math.abs(net))}`}
        hint="Орлого − зарлага"
      />
    </div>
  );
}
