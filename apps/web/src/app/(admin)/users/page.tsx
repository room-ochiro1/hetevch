import type { UserRole } from '@hetevch/shared';

import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { Panel } from '@/components/ui/panel';
import { UsersFilters } from '@/components/users/users-filters';
import { UsersTable } from '@/components/users/users-table';
import { listUsers } from '@/lib/dal/users';
import { getPage, getParam } from '@/lib/search-params';

function parseRole(value: string | undefined): UserRole | undefined {
  return value === 'admin' || value === 'user' ? value : undefined;
}

export default async function UsersPage({ searchParams }: PageProps<'/users'>) {
  const params = await searchParams;
  const search = getParam(params, 'q');
  const role = parseRole(getParam(params, 'role'));
  const page = getPage(params);
  const { rows, total } = await listUsers({ search, role, page });

  return (
    <>
      <PageHeader title="Хэрэглэгчид" description="Аппад бүртгүүлсэн бүх хэрэглэгч" />
      <UsersFilters search={search} role={role} />
      <Panel flush>
        <UsersTable users={rows} />
        <Pagination basePath="/users" page={page} total={total} params={{ q: search, role }} />
      </Panel>
    </>
  );
}
