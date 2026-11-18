import { addDays, formatDayLabel, formatMoney, formatNet, formatSignedMoney } from '@hetevch/shared';
import Link from 'next/link';

import { BarList, DetailHeader, detailHref, Section, Stats, type DetailCtx } from '@/components/detail/detail-parts';
import { TxTable } from '@/components/detail/detail-people';
import { AGE_BAND_LABELS } from '@/lib/age-bands';
import { getDayDetail } from '@/lib/dal/details';
import { percent } from '@/lib/day-series';
import { formatCount, formatDay } from '@/lib/format';
import { todayInUlaanbaatar } from '@/lib/range';

const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ulaanbaatar', hour: '2-digit', minute: '2-digit' });

/** One day: money in and out, who was active, which categories, every transaction. */
export async function DayDetailView({ day, ctx }: { day: string; ctx: DetailCtx }) {
  const { band } = ctx.filters;
  const detail = await getDayDetail(day, band, ctx.filters.sex);
  const { totals } = detail;
  const today = todayInUlaanbaatar();
  const step = (delta: number) => detailHref(ctx, { type: 'day', day: addDays(day, delta) });
  const ofKind = (kind: 'income' | 'expense') => detail.categories.filter((row) => row.kind === kind);
  const categoryRows = (kind: 'income' | 'expense') =>
    ofKind(kind).map((row) => ({
      key: row.id ?? `none-${kind}`,
      label: row.name,
      icon: row.icon,
      value: row.amount,
      text: formatMoney(row.amount),
      note: `${percent(row.amount, kind === 'income' ? totals.income : totals.expense)} · ${formatCount(row.txCount)} гүйлгээ`,
      href: row.id ? detailHref(ctx, { type: 'category', id: row.id, band: null }) : undefined,
    }));

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader
        icon="📅"
        title={formatDay(day)}
        subtitle={`${formatDayLabel(day, new Date(`${today}T12:00:00`))} · ${band ? AGE_BAND_LABELS[band] : 'бүх нас'}`}
      >
        <nav aria-label="Өдөр солих" className="flex gap-2 text-xs font-medium">
          <Link href={step(-1)} scroll={false} className="rounded-lg border border-border px-2.5 py-1 hover:bg-surface-2">
            ‹ Өмнөх өдөр
          </Link>
          {day < today ? (
            <Link href={step(1)} scroll={false} className="rounded-lg border border-border px-2.5 py-1 hover:bg-surface-2">
              Дараах өдөр ›
            </Link>
          ) : null}
        </nav>
      </DetailHeader>

      <Stats
        items={[
          { label: 'Орлого', value: `+${formatMoney(totals.income)}`, tone: 'income' },
          { label: 'Зарлага', value: `−${formatMoney(totals.expense)}`, tone: 'expense' },
          { label: 'Зөрүү', value: formatNet(totals.income - totals.expense) },
          { label: 'Гүйлгээ', value: formatCount(totals.txCount), hint: `${formatCount(totals.users)} хүн бүртгэсэн` },
          { label: 'Шинэ хэрэглэгч', value: formatCount(detail.newUsers), hint: 'Энэ өдөр бүртгүүлсэн' },
          {
            label: 'Нэг хүнд',
            value: totals.users ? formatMoney(Math.round(totals.expense / totals.users)) : '—',
            hint: 'Идэвхтэй нэг хүний зарлага',
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Юунд зарцуулсан" hint="Ангилал дээр дарж задална">
          <BarList rows={categoryRows('expense')} barClass="bg-chart-expense" empty="Энэ өдөр зарлага алга" />
        </Section>
        <Section title="Хаанаас орсон" hint="Орлогын эх үүсвэр">
          <BarList rows={categoryRows('income')} barClass="bg-chart-income" empty="Энэ өдөр орлого алга" />
        </Section>
      </div>

      <Section
        title="Тухайн өдрийн гүйлгээнүүд"
        hint={detail.transactions.length >= 40 ? 'Сүүлийн 40-ийг харуулж байна' : `${formatCount(detail.transactions.length)} гүйлгээ`}
      >
        <TxTable
          empty="Энэ өдөр гүйлгээ бүртгэгдээгүй"
          rows={detail.transactions.map((row) => ({
            id: row.id,
            when: time.format(new Date(row.createdAt)),
            person: row,
            what: row.category ? `${row.icon ?? ''} ${row.category}`.trim() : 'Ангилалгүй',
            note: row.note,
            amount: formatSignedMoney({ kind: row.kind, amount: row.amount }),
            tone: row.kind,
          }))}
        />
      </Section>
    </div>
  );
}
