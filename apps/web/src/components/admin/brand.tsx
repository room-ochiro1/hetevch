import Link from 'next/link';

import { WalletIcon } from '@/components/ui/icons';

/** The app mark: an ink tile. `compact` drops the name (the desktop rail). */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" title="Хэтэвч — Хянах самбар" className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-2xl bg-ink text-on-ink shadow-card">
        <WalletIcon className="size-5" />
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block font-semibold">Хэтэвч</span>
          <span className="block text-xs text-muted">Админ самбар</span>
        </span>
      )}
    </Link>
  );
}
