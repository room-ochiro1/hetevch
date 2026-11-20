import Link from 'next/link';
import { Suspense } from 'react';

import { HeaderSearch } from '@/components/admin/header-search';
import { requireAdmin } from '@/lib/dal/auth';
import { getDashboard } from '@/lib/dal/analytics';
import { formatCount, formatShortDay } from '@/lib/format';
import type { Filters } from '@/lib/filters';
import { greetingFor, ulaanbaatarClock, weekdayName } from '@/lib/greeting';
import { todayInUlaanbaatar } from '@/lib/range';

/** "Өглөөний мэнд, Бат" and one line on what happened today (Ulaanbaatar time). */
async function Greeting({ filters }: { filters: Filters }) {
  const admin = await requireAdmin();
  const { daily } = await getDashboard(filters.days, filters.band, filters.sex);
  const today = todayInUlaanbaatar();
  const row = daily.find((d) => d.day === today);
  const firstName = admin.fullName?.trim().split(/\s+/)[0];
  const hello = greetingFor(ulaanbaatarClock().hour);
  const happened = row
    ? `өнөөдөр ${formatCount(row.txCount)} гүйлгээ, ${formatCount(row.newUsers)} шинэ хэрэглэгч`
    : 'өнөөдөр одоохондоо үйл явдал алга';

  return (
    <div className="min-w-0">
      <h1 className="text-[26px] leading-tight font-semibold tracking-tight">
        {firstName ? `${hello}, ${firstName}` : hello}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {weekdayName(today)}, {formatShortDay(today)} · {happened}
      </p>
    </div>
  );
}

function GreetingSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <div className="h-8 w-64 animate-pulse rounded-xl bg-surface-2" />
      <div className="h-4 w-80 animate-pulse rounded-lg bg-surface-2" />
    </div>
  );
}

/** Dashboard top: greeting on the left; user search and the main action on the right. */
export function DashboardHeader({ filters }: { filters: Filters }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Suspense fallback={<GreetingSkeleton />}>
        <Greeting filters={filters} />
      </Suspense>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <HeaderSearch />
        <Link
          href="/categories"
          className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-on-ink shadow-card hover:opacity-90"
        >
          <span aria-hidden className="text-base leading-none">+</span>
          Ангилал нэмэх
        </Link>
      </div>
    </header>
  );
}
