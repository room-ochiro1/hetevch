'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardIcon, ResearchIcon, TagIcon, TransferIcon, UsersIcon } from '@/components/ui/icons';

const LINKS = [
  { href: '/', label: 'Хянах самбар', icon: DashboardIcon },
  { href: '/research', label: 'Судалгаа', icon: ResearchIcon },
  { href: '/users', label: 'Хэрэглэгчид', icon: UsersIcon },
  { href: '/transactions', label: 'Гүйлгээ', icon: TransferIcon },
  { href: '/categories', label: 'Ангилал', icon: TagIcon },
] as const;

type Orientation = 'vertical' | 'horizontal';

/** Pure list; `pathname` null renders it without an active item (prerendered shell). */
function NavList({ pathname, orientation }: { pathname: string | null; orientation: Orientation }) {
  return (
    <nav
      aria-label="Үндсэн цэс"
      className={orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-1 overflow-x-auto'}
    >
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          pathname !== null && (href === '/' ? pathname === '/' : pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent-soft text-accent-text'
                : 'text-muted hover:bg-surface-2 hover:text-foreground'
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNavList({ orientation }: { orientation: Orientation }) {
  return <NavList pathname={usePathname()} orientation={orientation} />;
}

/**
 * usePathname() suspends while prerendering dynamic routes such as /users/[id], so the
 * active highlight streams in behind Suspense while the plain links stay in the static shell.
 */
export function NavLinks({ orientation = 'vertical' }: { orientation?: Orientation }) {
  return (
    <Suspense fallback={<NavList pathname={null} orientation={orientation} />}>
      <ActiveNavList orientation={orientation} />
    </Suspense>
  );
}
