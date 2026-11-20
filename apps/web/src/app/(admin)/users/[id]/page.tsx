import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { TransactionsTable } from '@/components/transactions/transactions-table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { Panel } from '@/components/ui/panel';
import { RoleForm } from '@/components/users/role-form';
import { UserAnalytics, UserAnalyticsSkeleton } from '@/components/users/user-analytics';
import { UserSummary } from '@/components/users/user-summary';
import { listTransactions } from '@/lib/dal/transactions';
import { getUserDetail } from '@/lib/dal/user-detail';
import { formatDateTime } from '@/lib/format';
import { isUuid } from '@/lib/parse';
import { getPage } from '@/lib/search-params';
import { userName, userSubtitle } from '@/lib/user-label';

export default async function UserDetailPage({ params, searchParams }: PageProps<'/users/[id]'>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const page = getPage(await searchParams);
  const [user, transactions] = await Promise.all([
    getUserDetail(id),
    listTransactions({ userId: id, page }),
  ]);

  return (
    <>
      <Link
        href="/users"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeftIcon /> Хэрэглэгчид
      </Link>

      <PageHeader
        title={userName(user)}
        description={`${userSubtitle(user)} · Бүртгүүлсэн: ${formatDateTime(user.createdAt)}`}
        actions={
          user.role === 'admin' ? <Badge tone="accent">Админ</Badge> : <Badge>Хэрэглэгч</Badge>
        }
      />

      <UserSummary summary={user.summary} />

      <Suspense fallback={<UserAnalyticsSkeleton />}>
        <UserAnalytics userId={user.id} />
      </Suspense>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title="Гүйлгээ" description="Шинэ нь эхэндээ" flush>
          <TransactionsTable rows={transactions.rows} showUser={false} />
          <Pagination basePath={`/users/${id}`} page={page} total={transactions.total} />
        </Panel>
        <Panel title="Эрх">
          <RoleForm userId={user.id} name={userName(user)} role={user.role} isSelf={user.isSelf} />
        </Panel>
      </div>
    </>
  );
}
