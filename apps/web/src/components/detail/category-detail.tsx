import { formatMoney, formatSignedMoney, KIND_LABELS } from '@hetevch/shared';
import Link from 'next/link';

import { DailyBarChart } from '@/components/dashboard/daily-bar-chart';
import { BarList, DetailHeader, detailHref, Section, Stats, type DetailCtx } from '@/components/detail/detail-parts';
import { PeopleList, TxTable } from '@/components/detail/detail-people';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE, type AgeBand } from '@/lib/age-bands';
import { getCategoryDetail } from '@/lib/dal/details';
import { fillDays, percent } from '@/lib/day-series';
import { formatCount, formatShortDay } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));

/** One category: how much, who, which ages, which days, and the latest transactions. */
export async function CategoryDetailView({ id, band: own, ctx }: { id: string; band: AgeBand | null; ctx: DetailCtx }) {
  const { days } = ctx.filters;
  const band = own ?? ctx.filters.band;
  const detail = await getCategoryDetail(id, days, band, ctx.filters.sex);
  const { category, totals } = detail;
  const kind = category.kind;
  const verb = kind === 'expense' ? 'зарцуулсан' : 'орсон';
  const bands = AGE_BANDS.flatMap((key) => detail.byBand.filter((row) => row.band === key));
  const busiest = detail.daily.reduce<{ day: string; amount: number } | null>(
    (best, row) => (!best || row.amount > best.amount ? row : best),
    null,
  );
  const scope = band ? AGE_BAND_LABELS[band] : 'бүх нас';

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader
        icon={category.icon}
        title={category.name}
        subtitle={`${KIND_LABELS[kind]}ийн ангилал · сүүлийн ${days} хоног · ${scope}`}
      >
        {band ? (
          <Link
            href={detailHref(ctx, { type: 'category', id, band: null }, { band: null })}
            scroll={false}
            className="self-start text-xs font-medium text-accent-text hover:underline"
          >
            ← Бүх насаар харах
          </Link>
        ) : null}
      </DetailHeader>

      <Stats
        items={[
          { label: `Нийт ${verb}`, value: money(totals.amount), tone: kind },
          { label: 'Гүйлгээ', value: formatCount(totals.txCount), hint: `Нэг гүйлгээ дунджаар ${totals.txCount ? money(totals.amount / totals.txCount) : '—'}` },
          { label: 'Хэрэглэгч', value: formatCount(totals.users), hint: `Нэг хүнд ${totals.users ? money(totals.amount / totals.users) : '—'}` },
          { label: 'Өдрийн дундаж', value: money(totals.amount / days), hint: busiest ? `Оргил: ${formatShortDay(busiest.day)}, ${money(busiest.amount)}` : undefined },
        ]}
      />

      <Section title="Өдөр бүрээр" hint="Багана дээр дарж тухайн өдрийн бүх гүйлгээг харна">
        <DailyBarChart
          label={category.name}
          unit="money"
          data={fillDays(detail.daily, days)}
          link={{ basePath: ctx.basePath, filters: { ...ctx.filters, band } }}
        />
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Насны бүлгээр" hint={`Аль насныхан энэ ангилалд хамгийн их ${verb} вэ`}>
          <BarList
            empty="Энэ хугацаанд гүйлгээ алга"
            barClass={kind === 'expense' ? 'bg-chart-expense' : 'bg-chart-income'}
            rows={bands.map((row) => ({
              key: row.band,
              label: AGE_BAND_LABELS[row.band],
              value: row.amount,
              text: money(row.amount),
              note: `${percent(row.amount, totals.amount)} · ${formatCount(row.users)} хүн · нэг хүнд ${money(row.amount / Math.max(1, row.users))}${row.users < MIN_SAMPLE ? ' · бага түүвэр' : ''}`,
              href: detailHref(ctx, { type: 'band', band: row.band }),
            }))}
          />
        </Section>
        <Section title={kind === 'expense' ? 'Хамгийн их зарцуулсан хүмүүс' : 'Хамгийн их орлоготой хүмүүс'}>
          <PeopleList
            empty="Энэ хугацаанд хэрэглэгч алга"
            people={detail.topUsers.map((user) => ({
              ...user,
              value: money(user.amount),
              note: `${formatCount(user.txCount)} гүйлгээ · ${percent(user.amount, totals.amount)}`,
            }))}
          />
        </Section>
      </div>

      <Section title="Сүүлийн гүйлгээнүүд" hint="Хамгийн сүүлийн 15">
        <TxTable
          empty="Гүйлгээ алга"
          rows={detail.recent.map((row) => ({
            id: row.id,
            when: formatShortDay(row.occurredOn),
            person: row,
            what: `${category.icon} ${category.name}`,
            note: row.note,
            amount: formatSignedMoney({ kind, amount: row.amount }),
            tone: kind,
          }))}
        />
      </Section>
    </div>
  );
}
