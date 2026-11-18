import { KIND_LABELS, formatSignedMoney } from '@hetevch/shared';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import type { AdminTransaction } from '@/lib/dal/transactions';
import { formatDay } from '@/lib/format';

type TransactionsTableProps = {
  rows: AdminTransaction[];
  /** Hide the user column on a single user's page. */
  showUser?: boolean;
};

const th = 'px-5 py-3 font-medium';
const td = 'px-5 py-3';

export function TransactionsTable({ rows, showUser = true }: TransactionsTableProps) {
  if (rows.length === 0) {
    return <EmptyState title="Гүйлгээ олдсонгүй" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-y border-border bg-surface-2/50 text-xs text-muted">
          <tr>
            <th className={th}>Огноо</th>
            {showUser ? <th className={th}>Хэрэглэгч</th> : null}
            <th className={th}>Ангилал</th>
            <th className={th}>Төрөл</th>
            <th className={`${th} text-right`}>Дүн</th>
            <th className={th}>Тэмдэглэл</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
              <td className={`${td} whitespace-nowrap text-muted tabular-nums`}>
                {formatDay(tx.occurredOn)}
              </td>
              {showUser ? (
                <td className={td}>
                  {tx.user ? (
                    <Link href={`/users/${tx.user.id}`} className="hover:text-accent-text">
                      {tx.user.label}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
              ) : null}
              <td className={`${td} whitespace-nowrap`}>
                {tx.category ? (
                  <>
                    <span aria-hidden>{tx.category.icon}</span> {tx.category.name}
                  </>
                ) : (
                  '—'
                )}
              </td>
              <td className={td}>
                <Badge tone={tx.kind}>{KIND_LABELS[tx.kind]}</Badge>
              </td>
              <td
                className={`${td} whitespace-nowrap text-right font-medium tabular-nums ${
                  tx.kind === 'income' ? 'text-income' : 'text-expense'
                }`}
              >
                {formatSignedMoney(tx)}
              </td>
              <td className={`${td} max-w-64 truncate text-muted`} title={tx.note ?? undefined}>
                {tx.note ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
