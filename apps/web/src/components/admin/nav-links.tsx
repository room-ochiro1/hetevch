'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Хянах самбар' },
  { href: '/users', label: 'Хэрэглэгчид' },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ href, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm ${
              active ? 'bg-accent text-white' : 'text-foreground hover:bg-background'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
