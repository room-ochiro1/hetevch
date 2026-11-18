import { Heatmap } from '@/components/charts/heatmap';
import { EmptyState } from '@/components/ui/empty-state';
import { Panel } from '@/components/ui/panel';
import { getActivityHeatmap } from '@/lib/dal/analytics';
import { formatCount } from '@/lib/format';
import type { Filters } from '@/lib/filters';

const WEEKDAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];

export async function HeatmapPanel({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const cells = await getActivityHeatmap(days, band, sex);
  const peak = cells.reduce<(typeof cells)[number] | null>(
    (best, cell) => (!best || cell.count > best.count ? cell : best),
    null,
  );

  return (
    <Panel
      title="Хэзээ бүртгэдэг вэ?"
      description={
        peak
          ? `Хамгийн идэвхтэй: ${WEEKDAYS[peak.weekday - 1]} ${String(peak.hour).padStart(2, '0')}:00 (${formatCount(peak.count)} гүйлгээ) · Улаанбаатарын цаг`
          : 'Гараг, цагаар · Улаанбаатарын цаг'
      }
    >
      {cells.length === 0 ? (
        <EmptyState
          title="Энэ хугацаанд гүйлгээ бүртгэгдээгүй"
          hint="Хэрэглэгчид аппаа ашиглаж эхлэхэд аль өдөр, аль цагт идэвхтэй байгаа нь энд харагдана."
        />
      ) : (
        <Heatmap cells={cells} label={`Сүүлийн ${days} хоногт гараг, цагаар бүртгэсэн гүйлгээ`} />
      )}
    </Panel>
  );
}
