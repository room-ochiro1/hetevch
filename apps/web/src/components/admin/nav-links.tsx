'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardIcon, ResearchIcon, TagIcon, TransferIcon, UsersIcon } from '@/components/ui/icons';

const LINKS = [
  { href: '/', label: 'Самбар', title: 'Хянах самбар', icon: DashboardIcon },
  { href: '/research', label: 'Судалгаа', title: 'Судалгаа', icon: ResearchIcon },
  { href: '/users', label: 'Хэрэглэгч', title: 'Хэрэглэгчид', icon: UsersIcon },
  { href: '/transactions', label: 'Гүйлгээ', title: 'Гүйлгээ', icon: TransferIcon },
  { href: '/categories', label: 'Ангилал', title: 'Ангилал', icon: TagIcon },
] as const;

type Orientation = 'rail' | 'horizontal';

const isActive = (pathname: string | null, href: string) =>
  pathname !== null && (href === '/' ? pathname === '/' : pathname.startsWith(href));

/** Pure list; `pathname` null renders it without an active item (prerendered shell). */
function NavList({ pathname, orientation }: { pathname: string | null; orientation: Orientation }) {
  if (orientation === 'horizontal') {
    return (
      <nav aria-label="Үндсэн цэс" className="-mx-1 flex gap-1 overflow-x-auto px-1">
        {LINKS.map(({ href, title, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ${
                active ? 'bg-ink text-on-ink' : 'bg-surface text-muted hover:text-foreground'
              }`}
            >
              <Icon />
              {title}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Үндсэн цэс" className="flex flex-col items-center gap-3">
      {LINKS.map(({ href, label, title, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            title={title}
            aria-current={active ? 'page' : undefined}
            className="group flex w-[72px] flex-col items-center gap-1 rounded-2xl py-1"
          >
            <span
              className={`grid h-9 w-12 place-items-center rounded-xl transition-colors ${
                active
                  ? 'bg-ink text-on-ink shadow-card'
                  : 'text-muted group-hover:bg-surface group-hover:text-foreground'
              }`}
            >
              <Icon className="size-[18px]" />
            </span>
            <span
              className={`text-[11px] leading-none font-medium ${
                active ? 'text-foreground' : 'text-muted group-hover:text-foreground'
              }`}
            >
              {label}
            </span>
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
export function NavLinks({ orientation = 'rail' }: { orientation?: Orientation }) {
  return (
    <Suspense fallback={<NavList pathname={null} orientation={orientation} />}>
      <ActiveNavList orientation={orientation} />
    </Suspense>
  );
}
