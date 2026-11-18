import type { TransactionKind } from '@hetevch/shared';
import Link from 'next/link';

import { buildQuery } from '@/lib/search-params';

const TABS: { value?: TransactionKind; label: string }[] = [
  { label: 'Бүгд' },
  { value: 'expense', label: 'Зарлага' },
  { value: 'income', label: 'Орлого' },
];

type KindTabsProps = {
  basePath: string;
  active?: TransactionKind;
};

export function KindTabs({ basePath, active }: KindTabsProps) {
  return (
    <nav aria-label="Гүйлгээний төрөл" className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {TABS.map((tab) => {
        const selected = tab.value === active;
        return (
          <Link
            key={tab.label}
            href={`${basePath}${buildQuery({ kind: tab.value })}`}
            aria-current={selected ? 'page' : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              selected ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
