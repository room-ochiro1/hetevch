import { formatAmount, formatMoney } from '@hetevch/shared';
import Link from 'next/link';

import { BandSections } from '@/components/detail/band-sections';
import { DetailHeader, detailHref, Stats, type DetailCtx } from '@/components/detail/detail-parts';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE, type AgeBand } from '@/lib/age-bands';
import { getBandDetail } from '@/lib/dal/details';
import { percent } from '@/lib/day-series';
import { formatCount } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));
const per = (total: number, people: number) => (people > 0 ? money(total / people) : '—');

/** Everything about one age band: how much comes in, where it goes, what they save for. */
export async function BandDetailView({ band, ctx }: { band: AgeBand; ctx: DetailCtx }) {
  const { days } = ctx.filters;
  const detail = await getBandDetail(band, days);
  const { savings } = detail;
  const kept = detail.income - detail.expense;

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader
        icon="👥"
        title={AGE_BAND_LABELS[band]}
        subtitle={`${formatCount(detail.users)} хэрэглэгч · сүүлийн ${days} хоног · админ ороогүй${
          detail.users < MIN_SAMPLE ? ' · бага түүвэр, дүгнэлт хийхэд эрт' : ''
        }`}
      >
        <nav aria-label="Насны бүлэг солих" className="flex flex-wrap gap-1.5">
          {AGE_BANDS.map((key) => (
            <Link
              key={key}
              href={detailHref(ctx, { type: 'band', band: key })}
              scroll={false}
              aria-current={key === band ? 'true' : undefined}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                key === band
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted hover:text-foreground'
              }`}
            >
              {AGE_BAND_LABELS[key]}
            </Link>
          ))}
        </nav>
      </DetailHeader>

      <Stats
        items={[
          {
            label: 'Идэвхтэй',
            value: formatCount(detail.activeUsers),
            hint: `${percent(detail.activeUsers, detail.users)} нь гүйлгээ бүртгэсэн · ${formatCount(detail.newUsers)} шинэ`,
          },
          {
            label: 'Орж ирсэн мөнгө',
            value: money(detail.income),
            tone: 'income',
            hint: `Идэвхтэй нэг хүнд ${per(detail.income, detail.activeUsers)}`,
          },
          {
            label: 'Зарцуулсан',
            value: money(detail.expense),
            tone: 'expense',
            hint: `Нэг хүнд ${per(detail.expense, detail.activeUsers)} · орлогын ${percent(detail.expense, detail.income)}`,
          },
          {
            label: 'Үлдсэн',
            value: `${kept < 0 ? '−' : ''}${money(Math.abs(kept))}`,
            hint: kept < 0 ? 'Орлогоосоо их зарцуулсан' : 'Орлого − зарлага',
          },
          {
            label: 'Хадгаламжтай',
            value: formatCount(savings.savers),
            hint: `${percent(savings.savers, detail.users)} нь · ${formatCount(savings.cards)} карт`,
          },
          {
            label: 'Хадгалсан',
            value: money(savings.savedMnt),
            hint: savings.savedUsd > 0 ? `+ ${formatAmount(savings.savedUsd, 'USD')}` : `Нэг хүнд ${per(savings.savedMnt, savings.savers)}`,
          },
          {
            label: 'Зорилгын биелэлт',
            value: savings.goalMnt > 0 ? percent(savings.savedMnt, savings.goalMnt) : '—',
            hint: savings.goalMnt > 0 ? `${money(savings.goalMnt)} зорилгоос` : 'Төгрөгийн зорилго тавиагүй',
          },
          {
            label: 'Гүйлгээ',
            value: formatCount(detail.txCount),
            hint: `Нэг хүн дунджаар ${detail.activeUsers ? Math.round(detail.txCount / detail.activeUsers) : 0}`,
          },
        ]}
      />

      <BandSections detail={detail} ctx={ctx} />
    </div>
  );
}
