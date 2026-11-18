import { LineChart } from '@/components/charts/line-chart';
import { DailyBarChart } from '@/components/dashboard/daily-bar-chart';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import { formatCount } from '@/lib/format';
import type { RangeDays } from '@/lib/range';

/**
 * Daily active users and daily signups: different measures, so two charts side by side
 * rather than one chart with two axes.
 */
export async function EngagementPanels({ days }: { days: RangeDays }) {
  const { daily, current } = await getDashboard(days);
  const peak = daily.reduce((best, d) => (d.activeUsers > best.activeUsers ? d : best), daily[0]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="Өдөр тутмын идэвхтэй хэрэглэгч"
        description={
          peak && peak.activeUsers > 0
            ? `Гүйлгээ бүртгэсэн хүн · оргил нь ${formatCount(peak.activeUsers)}`
            : 'Тухайн өдөр гүйлгээ бүртгэсэн хүний тоо'
        }
      >
        <LineChart
          label={`Сүүлийн ${days} хоногийн өдөр тутмын идэвхтэй хэрэглэгч`}
          unit="хэрэглэгч"
          data={daily.map((d) => ({ day: d.day, value: d.activeUsers }))}
        />
      </Panel>
      <Panel
        title="Шинэ бүртгэл"
        description={`Сүүлийн ${days} хоногт ${formatCount(current.newUsers)} хүн бүртгүүлсэн`}
      >
        <DailyBarChart
          label="Шинэ хэрэглэгч"
          unit="count"
          data={daily.map((d) => ({ day: d.day, value: d.newUsers }))}
        />
      </Panel>
    </div>
  );
}
