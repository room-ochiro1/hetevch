import { formatMoney, KIND_LABELS } from '@hetevch/shared';

import { DailyBarChart } from '@/components/dashboard/daily-bar-chart';
import { BarList, DetailHeader, detailHref, Section, Stats, type DetailCtx } from '@/components/detail/detail-parts';
import { AGE_BANDS, AGE_BAND_LABELS } from '@/lib/age-bands';
import { changeRatio } from '@/lib/chart-scale';
import { getDashboard } from '@/lib/dal/analytics';
import { getTopCategories } from '@/lib/dal/overview';
import { getResearch } from '@/lib/dal/research';
import { percent } from '@/lib/day-series';
import { formatCount, formatShortDay } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));

/** All income or all expense for the period: trend, categories, and which ages it comes from. */
export async function KindDetailView({ kind, ctx }: { kind: 'income' | 'expense'; ctx: DetailCtx }) {
  const { days, band, sex } = ctx.filters;
  const [dashboard, categories, research] = await Promise.all([
    getDashboard(days, band, sex),
    getTopCategories(kind, days, band, sex),
    getResearch(days, null, sex),
  ]);
  const total = dashboard.current[kind];
  const previous = dashboard.previous[kind];
  const ratio = changeRatio(total, previous);
  const peak = dashboard.daily.reduce((best, d) => (d[kind] > best[kind] ? d : best), dashboard.daily[0]);
  const activeDays = dashboard.daily.filter((d) => d[kind] > 0).length;
  const bandTotal = research.allBands.reduce((sum, row) => sum + row[kind], 0);
  const bar = kind === 'income' ? 'bg-chart-income' : 'bg-chart-expense';
  const bandRows = AGE_BANDS.flatMap((key) => research.allBands.filter((row) => row.band === key && row[kind] > 0));

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader
        icon={kind === 'income' ? '📈' : '📉'}
        title={kind === 'income' ? 'Орж ирсэн мөнгө' : 'Зарцуулсан мөнгө'}
        subtitle={`${KIND_LABELS[kind]} · сүүлийн ${days} хоног · ${band ? AGE_BAND_LABELS[band] : 'бүх нас'}`}
      />

      <Stats
        items={[
          { label: `Нийт ${KIND_LABELS[kind].toLowerCase()}`, value: money(total), tone: kind },
          {
            label: 'Өмнөх үетэй',
            value: ratio === null ? 'Шинэ' : `${ratio >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(ratio * 100))}%`,
            hint: `Өмнөх ${days} хоногт ${money(previous)}`,
          },
          { label: 'Өдрийн дундаж', value: money(total / days), hint: `${formatCount(activeDays)} өдөр гүйлгээтэй` },
          {
            label: 'Хамгийн их өдөр',
            value: peak && peak[kind] > 0 ? money(peak[kind]) : '—',
            hint: peak && peak[kind] > 0 ? formatShortDay(peak.day) : undefined,
          },
        ]}
      />

      <Section title="Өдөр бүрээр" hint="Багана дээр дарж тухайн өдрийг задална">
        <DailyBarChart
          label={KIND_LABELS[kind]}
          unit="money"
          data={dashboard.daily.map((d) => ({ day: d.day, value: d[kind] }))}
          link={ctx}
        />
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title={kind === 'income' ? 'Хаанаас орж ирсэн' : 'Юунд зарцуулсан'} hint="Эхний 8 ангилал · дарж задална">
          <BarList
            empty="Гүйлгээ алга"
            barClass={bar}
            rows={categories.map((row) => ({
              key: row.categoryId,
              label: row.name,
              icon: row.icon,
              value: row.total,
              text: money(row.total),
              note: `${percent(row.total, total)} · ${formatCount(row.txCount)} гүйлгээ`,
              href: detailHref(ctx, { type: 'category', id: row.categoryId, band: null }),
            }))}
          />
        </Section>
        <Section title="Насны бүлгээр" hint="Хэрэглэгчид (админ ороогүй) · дарж задална">
          <BarList
            empty="Гүйлгээ алга"
            barClass={bar}
            rows={bandRows.map((row) => ({
              key: row.band,
              label: AGE_BAND_LABELS[row.band],
              value: row[kind],
              text: money(row[kind]),
              note: `${percent(row[kind], bandTotal)} · идэвхтэй нэг хүнд ${money(row[kind] / Math.max(1, row.activeUsers))}`,
              href: detailHref(ctx, { type: 'band', band: row.band }),
              dim: band !== null && band !== row.band,
            }))}
          />
        </Section>
      </div>
    </div>
  );
}
