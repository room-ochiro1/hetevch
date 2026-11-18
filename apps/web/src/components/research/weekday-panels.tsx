import { formatMoney } from '@hetevch/shared';

import { ColumnChart } from '@/components/research/column-chart';
import { MatrixHeatmap } from '@/components/research/matrix-heatmap';
import { weekdayAverages } from '@/components/research/research-kpis';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE, WEEKDAY_LABELS } from '@/lib/age-bands';
import { getResearch } from '@/lib/dal/research';
import { formatCount } from '@/lib/format';
import type { Filters } from '@/lib/filters';

const money = (value: number) => formatMoney(Math.round(value));
const EMPTY_HINT = 'Хэрэглэгчид зарлага бүртгэхэд 7 хоногийн аль өдөр илүү зарцуулдаг нь энд гарна.';

/**
 * Which weekday money goes out: the average per day (a total would favour weekdays that
 * happen to occur more often in the period), then each age band's week split by day.
 */
export async function WeekdayPanels({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const research = await getResearch(days, band, sex);
  const averages = weekdayAverages(research);
  const counts = WEEKDAY_LABELS.map((_, i) =>
    research.weekdays.filter((row) => row.weekday === i + 1).reduce((sum, row) => sum + row.txCount, 0),
  );
  const hasData = averages.some((day) => day.total > 0);

  const rows = AGE_BANDS.flatMap((band) => {
    const perDay = WEEKDAY_LABELS.map((_, i) =>
      research.weekdays
        .filter((row) => row.band === band && row.weekday === i + 1)
        .reduce((sum, row) => sum + row.expense, 0),
    );
    const total = perDay.reduce((sum, value) => sum + value, 0);
    const people = research.bands.find((row) => row.band === band)?.users ?? 0;
    return total > 0 ? [{ band, perDay, total, small: people < MIN_SAMPLE }] : [];
  });

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Panel title="7 хоногийн аль өдөр зарцуулдаг вэ?" description="Тухайн гарагт ногдох дундаж зарлага (бүх хэрэглэгч)">
        {hasData ? (
          <ColumnChart
            label={`Сүүлийн ${days} хоногийн гараг тутмын дундаж зарлага`}
            barClass="bg-chart-expense"
            valueLabel="Дундаж зарлага"
            columns={averages.map((day, i) => ({
              label: WEEKDAY_LABELS[i] ?? '',
              value: day.average,
              display: money(day.average),
              rows: [
                { value: money(day.average), label: 'дундаж зарлага' },
                { value: money(day.total), label: `нийт (${research.weekdayCounts[i] ?? 0} удаа)` },
                { value: formatCount(counts[i] ?? 0), label: 'гүйлгээ' },
              ],
            }))}
          />
        ) : (
          <EmptyState title="Энэ хугацаанд зарлага бүртгэгдээгүй" hint={EMPTY_HINT} />
        )}
      </Panel>

      <Panel title="Насны бүлгээр, гараг тутам" description="Бүлэг бүрийн 7 хоногийн зарлага аль өдөрт хэдэн хувь · мөр бүр 100%">
        {rows.length > 0 ? (
          <MatrixHeatmap
            label={`Сүүлийн ${days} хоногийн зарлага насны бүлэг, гарагаар`}
            labelWidth={6.5}
            colWidth={2.75}
            rows={rows.map((row) => ({
              key: row.band,
              label: AGE_BAND_LABELS[row.band],
              note: row.small ? 'бага түүвэр' : undefined,
            }))}
            cols={WEEKDAY_LABELS.map((label) => ({ key: label, label: label.slice(0, 3) }))}
            shares={rows.map((row) => row.perDay.map((value) => value / row.total))}
            details={rows.map((row) =>
              row.perDay.map(
                (value, i) =>
                  `${AGE_BAND_LABELS[row.band]} · ${WEEKDAY_LABELS[i]}: ${money(value)} (${Math.round((value / row.total) * 100)}%)`,
              ),
            )}
          />
        ) : (
          <EmptyState title="Энэ хугацаанд зарлага бүртгэгдээгүй" hint={EMPTY_HINT} />
        )}
      </Panel>
    </div>
  );
}
