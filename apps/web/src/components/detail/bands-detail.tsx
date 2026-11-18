import { formatMoney } from '@hetevch/shared';

import { BarList, DetailHeader, detailHref, Section, Stats, type DetailCtx } from '@/components/detail/detail-parts';
import { AgeTable } from '@/components/research/age-table';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE, type AgeBand } from '@/lib/age-bands';
import { getResearch, type BandRow } from '@/lib/dal/research';
import { percent } from '@/lib/day-series';
import { formatCount } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));
const sum = (rows: BandRow[], pick: (row: BandRow) => number) => rows.reduce((total, row) => total + pick(row), 0);

/** All age bands side by side: how many people, who earns, spends and saves the most. */
export async function BandsDetailView({ ctx }: { ctx: DetailCtx }) {
  const { days } = ctx.filters;
  const { allBands } = await getResearch(days, null, ctx.filters.sex);
  const rows = AGE_BANDS.flatMap((band) => allBands.filter((row) => row.band === band && row.users > 0));
  const users = sum(rows, (r) => r.users);
  const unknown = sum(rows.filter((r) => r.band === 'unknown'), (r) => r.users);
  const income = sum(rows, (r) => r.income);
  const expense = sum(rows, (r) => r.expense);
  const saved = sum(rows, (r) => r.savedMnt);
  const href = (band: AgeBand) => detailHref(ctx, { type: 'band', band });
  const bars = (pick: (row: BandRow) => number, note: (row: BandRow) => string, total: number) =>
    rows.map((row) => ({
      key: row.band,
      label: AGE_BAND_LABELS[row.band],
      value: pick(row),
      text: money(pick(row)),
      note: `${percent(pick(row), total)} · ${note(row)}${row.users < MIN_SAMPLE ? ' · бага түүвэр' : ''}`,
      href: href(row.band),
      dim: ctx.filters.band !== null && ctx.filters.band !== row.band,
    }));

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader
        icon="👥"
        title="Насны бүлгүүд"
        subtitle={`Бүх хэрэглэгч насаар · сүүлийн ${days} хоног · админ ороогүй`}
      />

      <Stats
        items={[
          { label: 'Хэрэглэгч', value: formatCount(users), hint: `${percent(users - unknown, users)} нь насаа бүртгүүлсэн` },
          { label: 'Идэвхтэй', value: formatCount(sum(rows, (r) => r.activeUsers)), hint: 'Гүйлгээ бүртгэсэн' },
          { label: 'Орж ирсэн', value: money(income), tone: 'income' },
          { label: 'Зарцуулсан', value: money(expense), tone: 'expense', hint: `Орлогын ${percent(expense, income)}` },
          { label: 'Хадгаламжтай', value: formatCount(sum(rows, (r) => r.savers)), hint: `Нийт ${money(saved)} хадгалсан` },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Хэн хамгийн их орлоготой" hint="Нийт орлогын хувь">
          <BarList
            empty="Орлого алга"
            barClass="bg-chart-income"
            rows={bars((r) => r.income, (r) => `${formatCount(r.activeUsers)} идэвхтэй`, income)}
          />
        </Section>
        <Section title="Хэн хамгийн их зарцуулж байна" hint="Нийт зарлагын хувь">
          <BarList
            empty="Зарлага алга"
            barClass="bg-chart-expense"
            rows={bars((r) => r.expense, (r) => `нэг хүнд ${money(r.expense / Math.max(1, r.activeUsers))}`, expense)}
          />
        </Section>
        <Section title="Хэн хамгийн их хадгалж байна" hint="Төгрөгийн картууд">
          <BarList empty="Хадгаламж алга" rows={bars((r) => r.savedMnt, (r) => `${formatCount(r.savers)} хүн`, saved)} />
        </Section>
      </div>

      <Section title="Дундаж үзүүлэлтүүд" hint="Бүлгийн нэр дээр дарж задална">
        <AgeTable bands={rows} selected={ctx.filters.band} hrefFor={href} />
      </Section>
    </div>
  );
}
