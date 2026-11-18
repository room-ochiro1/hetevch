import { formatAmount, formatMoney } from '@hetevch/shared';
import Link from 'next/link';

import { BarList, DetailHeader, detailHref, Section, Stats, type DetailCtx } from '@/components/detail/detail-parts';
import { AGE_BANDS, AGE_BAND_LABELS, SAVINGS_PURPOSES, type AgeBand } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import { percent } from '@/lib/day-series';
import { formatCount, formatShortDay } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));

/** One savings purpose (the card's picture): who saves for it, how much, how close to the goal. */
export async function PurposeDetailView({ icon, band: own, ctx }: { icon: string; band: AgeBand | null; ctx: DetailCtx }) {
  const band = own ?? ctx.filters.band;
  const { cards: all } = await getResearch(ctx.filters.days, null, ctx.filters.sex);
  const everyBand = all.filter((card) => card.icon === icon);
  const cards = band ? everyBand.filter((card) => card.band === band) : everyBand;
  const mnt = cards.filter((c) => c.currency === 'MNT');
  const saved = mnt.reduce((sum, c) => sum + c.deposited, 0);
  const usd = cards.filter((c) => c.currency === 'USD').reduce((sum, c) => sum + c.deposited, 0);
  const withGoal = cards.filter((c) => c.goal && c.goal > 0);
  const progress = withGoal.length
    ? withGoal.reduce((sum, c) => sum + Math.min(1, c.deposited / (c.goal ?? 1)), 0) / withGoal.length
    : null;
  const owners = new Set(cards.map((c) => c.userId)).size;
  const byBand = AGE_BANDS.map((key) => {
    const rows = everyBand.filter((c) => c.band === key);
    return { band: key, count: rows.length, mnt: rows.filter((c) => c.currency === 'MNT').reduce((s, c) => s + c.deposited, 0) };
  }).filter((row) => row.count > 0);
  const name = SAVINGS_PURPOSES[icon] ?? 'Бусад зорилго';

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader icon={icon} title={name} subtitle={`Хадгаламжийн зорилго · ${band ? AGE_BAND_LABELS[band] : 'бүх нас'} · одоогийн байдлаар`}>
        {band ? (
          <Link href={detailHref(ctx, { type: 'purpose', icon, band: null }, { band: null })} scroll={false} className="self-start text-xs font-medium text-accent-text hover:underline">
            ← Бүх насаар харах
          </Link>
        ) : null}
      </DetailHeader>

      <Stats
        items={[
          { label: 'Карт', value: formatCount(cards.length), hint: `${formatCount(owners)} хүн` },
          { label: 'Хадгалсан', value: money(saved), hint: usd > 0 ? `+ ${formatAmount(usd, 'USD')}` : 'Төгрөгийн картууд' },
          { label: 'Нэг картад', value: mnt.length ? money(saved / mnt.length) : '—', hint: 'Төгрөгийн картын дундаж' },
          {
            label: 'Зорилгын биелэлт',
            value: progress === null ? '—' : `${Math.round(progress * 100)}%`,
            hint: `${formatCount(withGoal.length)} карт зорилготой`,
          },
        ]}
      />

      <Section title="Насны бүлгээр" hint="Аль насныхан энэ зорилгоор хамгийн их хадгалж байна · дарж шүүнэ">
        <BarList
          empty="Карт алга"
          rows={byBand.map((row) => ({
            key: row.band,
            label: AGE_BAND_LABELS[row.band],
            value: row.mnt,
            text: money(row.mnt),
            note: `${formatCount(row.count)} карт · ${percent(row.count, everyBand.length)}`,
            href: detailHref(ctx, { type: 'purpose', icon, band: row.band }),
            dim: band !== null && band !== row.band,
          }))}
        />
      </Section>

      <Section title="Картууд" hint="Хамгийн их хадгалсан нь эхэнд">
        {cards.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Карт алга</p>
        ) : (
          <ol className="flex flex-col">
            {[...cards].sort((a, b) => b.deposited - a.deposited).map((card) => (
              <li key={card.id} className="border-b border-border last:border-0">
                <Link href={`/users/${card.userId}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{card.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {card.owner} · {AGE_BAND_LABELS[card.band]} · {card.rate}% хүү
                      {card.lastMovedOn ? ` · сүүлд ${formatShortDay(card.lastMovedOn)}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm tabular-nums">
                    <span className="block font-semibold">{formatAmount(card.deposited, card.currency)}</span>
                    {card.goal ? (
                      <span className="block text-xs text-muted">зорилгын {percent(card.deposited, card.goal)}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
