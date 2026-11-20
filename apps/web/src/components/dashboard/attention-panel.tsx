import { AttentionItem } from '@/components/dashboard/attention-item';
import { Pill } from '@/components/ui/badge';
import { CheckIcon } from '@/components/ui/icons-more';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import { listCategories, listUserCategories } from '@/lib/dal/categories';
import { getTopCategories } from '@/lib/dal/overview';
import { filterHref, type Filters } from '@/lib/filters';
import { buildInsights, promoteCandidates } from '@/lib/insights';

/** "Таны анхаарах зүйлс": what changed, what stands out, and tasks only the admin can do. */
export async function AttentionPanel({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const [dashboard, topExpense, builtIn, own] = await Promise.all([
    getDashboard(days, band, sex),
    getTopCategories('expense', days, band, sex),
    listCategories(),
    listUserCategories(),
  ]);
  const insights = buildInsights({
    dashboard,
    days,
    topExpense,
    candidates: promoteCandidates(own.rows, builtIn),
    link: (detail) => filterHref('/', filters, detail),
  });

  return (
    <Panel
      title="Анхаарах зүйлс"
      description="Өөрчлөлт, онцлох тоо, таны хийх ажил"
      action={<Pill>{insights.length} нээлттэй</Pill>}
      className="h-full"
    >
      {insights.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-income-soft text-income">
            <CheckIcon className="size-5" />
          </span>
          <p className="text-sm font-medium">Одоохондоо анхаарах зүйл алга</p>
          <p className="text-xs text-muted">Том өөрчлөлт гарвал энд гарч ирнэ.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {insights.map((insight) => (
            <AttentionItem key={insight.key} insight={insight} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
