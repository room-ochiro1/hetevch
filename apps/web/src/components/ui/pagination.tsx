import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import Link from 'next/link';

import { formatCount } from '@/lib/format';
import { PAGE_SIZE, buildQuery } from '@/lib/search-params';

type PaginationProps = {
  basePath: string;
  page: number;
  total: number;
  /** Current filters, kept when moving between pages. */
  params?: Record<string, string | undefined>;
};

const linkClass =
  'inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-2';

export function Pagination({ basePath, page, total, params = {} }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (target: number) =>
    `${basePath}${buildQuery({ ...params, page: target > 1 ? target : undefined })}`;

  return (
    <nav
      aria-label="Хуудаслалт"
      className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-sm"
    >
      <span className="text-muted">
        Нийт {formatCount(total)} · {page}/{pages} хуудас
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={linkClass}>
            <ChevronLeftIcon /> Өмнөх
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={href(page + 1)} className={linkClass}>
            Дараах <ChevronRightIcon />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
