import { formatAmount, formatMoney } from '@hetevch/shared';

import { BarList, detailHref, Section, type DetailCtx } from '@/components/detail/detail-parts';
import { PeopleList } from '@/components/detail/detail-people';
import { SAVINGS_PURPOSES, WEEKDAY_LABELS } from '@/lib/age-bands';
import type { BandDetail } from '@/lib/dal/details';
import { percent, weekdayOccurrences } from '@/lib/day-series';
import { formatCount } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));

/** The lists of the age-band dialog: income sources, spending, weekdays, savings goals, people. */
export function BandSections({ detail, ctx }: { detail: BandDetail; ctx: DetailCtx }) {
  const { band } = detail;
  const times = weekdayOccurrences(ctx.filters.days);
  const weekdays = WEEKDAY_LABELS.map((label, index) => {
    const row = detail.weekday.find((w) => w.weekday === index + 1);
    const total = row?.expense ?? 0;
    const occurrences = times[index] ?? 0;
    return { label, total, average: occurrences > 0 ? total / occurrences : 0, txCount: row?.txCount ?? 0 };
  });
  const category = (id: string) => detailHref(ctx, { type: 'category', id, band });

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Мөнгө хаанаас орж ирж байна" hint="Орлогын ангиллаар">
          <BarList
            empty="Энэ хугацаанд орлого алга"
            barClass="bg-chart-income"
            rows={detail.topIncome.map((row) => ({
              key: row.id || row.name,
              label: row.name,
              icon: row.icon,
              value: row.amount,
              text: money(row.amount),
              note: `${percent(row.amount, detail.income)} · ${formatCount(row.txCount)} гүйлгээ`,
              href: row.id ? category(row.id) : undefined,
            }))}
          />
        </Section>
        <Section title="Юунд зарцуулж байна" hint="Ангилал дээр дарж энэ насныхны гүйлгээг харна">
          <BarList
            empty="Энэ хугацаанд зарлага алга"
            barClass="bg-chart-expense"
            rows={detail.topExpense.map((row) => ({
              key: row.id || row.name,
              label: row.name,
              icon: row.icon,
              value: row.amount,
              text: money(row.amount),
              note: `${percent(row.amount, detail.expense)} · ${formatCount(row.users)} хүн · ${formatCount(row.txCount)} гүйлгээ`,
              href: row.id ? category(row.id) : undefined,
            }))}
          />
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Юуны төлөө хадгалж байна" hint="Хадгаламжийн картын зорилгоор">
          <BarList
            empty="Хадгаламжийн карт алга"
            rows={detail.purposes.map((row) => ({
              key: row.icon,
              label: SAVINGS_PURPOSES[row.icon] ?? 'Бусад',
              icon: row.icon,
              value: row.savedMnt,
              text: money(row.savedMnt),
              note: [
                `${formatCount(row.cards)} карт · ${formatCount(row.savers)} хүн`,
                row.savedUsd > 0 ? `+ ${formatAmount(row.savedUsd, 'USD')}` : null,
                row.goalMnt > 0 ? `зорилгын ${percent(row.savedMnt, row.goalMnt)}` : null,
              ]
                .filter(Boolean)
                .join(' · '),
              href: detailHref(ctx, { type: 'purpose', icon: row.icon, band }),
            }))}
          />
        </Section>
        <Section title="Аль гарагт зарцуулдаг" hint="Тухайн гарагт нэг удаад дунджаар">
          <BarList
            empty="Зарлага алга"
            barClass="bg-chart-expense"
            rows={weekdays.map((row) => ({
              key: row.label,
              label: row.label,
              value: row.average,
              text: money(row.average),
              note: `Нийт ${money(row.total)} · ${formatCount(row.txCount)} гүйлгээ`,
            }))}
          />
        </Section>
      </div>

      <Section title="Хамгийн идэвхтэй хэрэглэгчид" hint="Гүйлгээний тоогоор · дарж хэрэглэгчийн хуудсыг нээнэ">
        <PeopleList
          empty="Энэ хугацаанд идэвхтэй хэрэглэгч алга"
          people={detail.topUsers.map((user) => ({
            ...user,
            value: `−${money(user.expense)}`,
            note: `${formatCount(user.txCount)} гүйлгээ · орлого ${money(user.income)}`,
          }))}
        />
      </Section>
    </>
  );
}
