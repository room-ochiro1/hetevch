import { KindTabs } from '@/components/transactions/kind-tabs';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { Panel } from '@/components/ui/panel';
import { listTransactions } from '@/lib/dal/transactions';
import { parseKind } from '@/lib/parse';
import { getPage, getParam } from '@/lib/search-params';

export default async function TransactionsPage({ searchParams }: PageProps<'/transactions'>) {
  const params = await searchParams;
  const kind = parseKind(getParam(params, 'kind'));
  const page = getPage(params);
  const { rows, total } = await listTransactions({ kind, page });

  return (
    <>
      <PageHeader
        title="Гүйлгээ"
        description="Бүх хэрэглэгчийн гүйлгээ, шинэ нь эхэндээ"
        actions={<KindTabs basePath="/transactions" active={kind} />}
      />
      <Panel flush>
        <TransactionsTable rows={rows} />
        <Pagination basePath="/transactions" page={page} total={total} params={{ kind }} />
      </Panel>
    </>
  );
}
