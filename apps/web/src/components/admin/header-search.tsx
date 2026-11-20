'use client';

import Form from 'next/form';
import { useEffect, useRef } from 'react';

import { SearchIcon } from '@/components/ui/icons';

/** Finds a user by name or email (opens /users?q=…). "/" focuses it from anywhere on the page. */
export function HeaderSearch() {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Form action="/users" role="search" className="relative w-full sm:w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
      <input
        ref={input}
        name="q"
        type="search"
        aria-label="Хэрэглэгч хайх"
        placeholder="Хэрэглэгч хайх…"
        className="h-10 w-full rounded-full bg-surface pr-10 pl-10 text-sm shadow-card outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-border px-1.5 text-[11px] text-muted">
        /
      </kbd>
    </Form>
  );
}
