import { KIND_LABELS } from '@hetevch/shared';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import type { UserCategory } from '@/lib/dal/categories';
import { formatCount, formatDateTime } from '@/lib/format';

const th = 'px-5 py-3 font-medium';
const td = 'px-5 py-3';

/** Read-only list of categories users made in the app: only their owner can change them. */
export function UserCategoryTable({ rows }: { rows: UserCategory[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Хэрэглэгч ангилал нэмээгүй байна"
        hint="Аппын Профайл → Миний ангилал хэсгээс нэмэхэд энд харагдана."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-y border-border bg-surface-2/50 text-xs text-muted">
          <tr>
            <th className={th}>Ангилал</th>
            <th className={th}>Төрөл</th>
            <th className={th}>Хэрэглэгч</th>
            <th className={`${th} text-right`}>Гүйлгээ</th>
            <th className={th}>Нэмсэн</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((category) => (
            <tr key={category.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
              <td className={td}>
                <span className="flex items-center gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-base"
                    style={{ backgroundColor: `${category.color}26` }}
                    aria-hidden
                  >
                    {category.icon}
                  </span>
                  <span className="truncate font-medium">{category.name}</span>
                </span>
              </td>
              <td className={td}>
                <Badge tone={category.kind}>{KIND_LABELS[category.kind]}</Badge>
              </td>
              <td className={td}>
                {category.owner ? (
                  <Link href={`/users/${category.owner.id}`} className="hover:text-accent-text">
                    {category.owner.label}
                  </Link>
                ) : (
                  '—'
                )}
              </td>
              <td className={`${td} text-right tabular-nums`}>{formatCount(category.txCount)}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>
                {formatDateTime(category.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
