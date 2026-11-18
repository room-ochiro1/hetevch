import {
  COMPOUNDING_LABELS,
  formatAmount,
  formatLongDate,
  formatRate,
  type SavingsCard,
  type SavingsStatus,
} from '@hetevch/shared';

import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';

type CardStatsProps = { card: SavingsCard; status: SavingsStatus };

/** The card's numbers: what went in, interest, term and goal. Rows without meaning are hidden. */
export function CardStats({ card, status }: CardStatsProps) {
  const money = (value: number) => formatAmount(value, card.currency);
  const rate = Number(card.annual_rate);
  const earning = rate > 0 && !status.matured;

  return (
    <>
      <SettingsGroup title="Дүн">
        <SettingsRow icon="💵" tone="peach" label="Хийсэн мөнгө" value={money(status.deposited)} />
        {rate > 0 ? (
          <SettingsRow icon="📈" tone="mint" label="Хуримтлагдсан хүү" value={`+${money(status.accrued)}`} />
        ) : null}
        {status.goal ? (
          <SettingsRow
            icon="🎯"
            tone="lavender"
            label="Зорилго хүртэл"
            value={status.goal.left > 0 ? `${money(status.goal.left)} дутуу` : 'Биелсэн 🎉'}
          />
        ) : null}
      </SettingsGroup>

      {rate > 0 ? (
        <SettingsGroup
          title="Хүү"
          footer={`${formatRate(rate)} · ${COMPOUNDING_LABELS[card.compounding]}${card.bank ? ` · ${card.bank}` : ''}. Татварын өмнөх дүн.`}>
          {earning ? (
            <>
              <SettingsRow icon="☀️" tone="peach" label="Өдөрт" value={`+${money(status.per.day)}`} />
              <SettingsRow icon="🗓️" tone="mint" label="Сард" value={`+${money(status.per.month)}`} />
              <SettingsRow icon="📆" tone="lavender" label="Жилд" value={`+${money(status.per.year)}`} />
            </>
          ) : null}
          {status.maturity ? (
            <SettingsRow
              icon="⏳"
              tone="accent"
              label={status.matured ? 'Хугацаа дууссан' : 'Хугацаа дуусах'}
              value={
                status.matured
                  ? formatLongDate(status.maturity)
                  : `${status.daysLeft} хоног үлдсэн`
              }
            />
          ) : null}
          {status.atMaturity !== null && !status.matured ? (
            <SettingsRow icon="🏁" tone="mint" label="Эцэст нь" value={money(status.atMaturity)} />
          ) : null}
        </SettingsGroup>
      ) : null}
    </>
  );
}
