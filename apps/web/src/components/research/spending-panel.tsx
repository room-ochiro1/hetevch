import { formatMoney } from '@hetevch/shared';

import { MatrixHeatmap } from '@/components/research/matrix-heatmap';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import type { Filters } from '@/lib/filters';

/** Columns beyond this many categories fold into "Бусад" so the grid stays readable. */
const TOP_CATEGORIES = 7;

/** What each age band spends on: every row is that band's spending split by category. */
export async function SpendingPanel({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const { spending, bands } = await getResearch(days, band, sex);

  const byCategory = new Map<string, { label: string; total: number }>();
  for (const row of spending) {
    const entry = byCategory.get(row.categoryId) ?? { label: `${row.icon} ${row.name}`, total: 0 };
    entry.total += row.total;
    byCategory.set(row.categoryId, entry);
  }
  const ranked = [...byCategory.entries()].sort((a, b) => b[1].total - a[1].total);
  const top = ranked.slice(0, TOP_CATEGORIES);
  const hasOther = ranked.length > TOP_CATEGORIES;
  const cols = [
    ...top.map(([key, entry]) => ({ key, label: entry.label })),
    ...(hasOther ? [{ key: 'other', label: 'Бусад' }] : []),
  ];
  const column = (categoryId: string) => {
    const index = top.findIndex(([key]) => key === categoryId);
    return index >= 0 ? index : cols.length - 1;
  };

  const rows = AGE_BANDS.flatMap((band) => {
    const items = spending.filter((row) => row.band === band);
    const total = items.reduce((sum, row) => sum + row.total, 0);
    if (total <= 0) return [];
    const amounts = cols.map(() => 0);
    for (const item of items) amounts[column(item.categoryId)] = (amounts[column(item.categoryId)] ?? 0) + item.total;
    const people = bands.find((row) => row.band === band)?.users ?? 0;
    return [{ band, total, amounts, small: people < MIN_SAMPLE }];
  });

  return (
    <Panel
      title="Юунд мөнгөө зарцуулж байна?"
      description="Насны бүлэг бүрийн зарлагын хэдэн хувь аль ангилалд очсон · мөр бүр 100%"
    >
      {rows.length === 0 ? (
        <EmptyState
          title="Энэ хугацаанд зарлага бүртгэгдээгүй"
          hint="Хэрэглэгчид зарлага бүртгэхэд насны бүлэг бүр юунд мөнгөө зарцуулж байгаа нь энд гарна."
        />
      ) : (
        <MatrixHeatmap
          label={`Сүүлийн ${days} хоногийн зарлага насны бүлэг, ангиллаар`}
          rows={rows.map((row) => ({
            key: row.band,
            label: AGE_BAND_LABELS[row.band],
            note: `${formatMoney(Math.round(row.total))}${row.small ? ' · бага түүвэр' : ''}`,
          }))}
          cols={cols}
          shares={rows.map((row) => row.amounts.map((amount) => amount / row.total))}
          details={rows.map((row) =>
            row.amounts.map(
              (amount, c) =>
                `${AGE_BAND_LABELS[row.band]} · ${cols[c]?.label ?? ''}: ${formatMoney(Math.round(amount))} (${Math.round((amount / row.total) * 100)}%)`,
            ),
          )}
        />
      )}
    </Panel>
  );
}
