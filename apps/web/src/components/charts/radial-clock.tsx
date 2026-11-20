import { DataTable } from '@/components/charts/chart-parts';
import { formatCount } from '@/lib/format';

const C = 150;
const INNER = 50;
const OUTER = 108;
const DIAL = 120;

/** Point at `radius` for an hour of the day (0 at the top, clockwise). */
function at(hour: number, radius: number): [number, number] {
  const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
  return [C + radius * Math.cos(angle), C + radius * Math.sin(angle)];
}

const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

type RadialClockProps = {
  /** 24 counts, index = hour of day (Ulaanbaatar). */
  hours: number[];
  /** Current time for the hand and the centre ("14:32"). */
  now: { hour: number; minute: number; text: string };
  label: string;
};

/**
 * The day as a clock face: one bar per hour, longer = more transactions logged in that hour;
 * the busiest hour in ink, the hand at the current time. Hover a bar for its count.
 */
export function RadialClock({ hours, now, label }: RadialClockProps) {
  const max = Math.max(1, ...hours);
  const peak = hours.indexOf(Math.max(...hours));
  const [handX, handY] = at(now.hour + now.minute / 60, DIAL + 4);

  return (
    <figure className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 300 300" role="img" aria-label={label} className="w-full overflow-visible">
        <circle cx={C} cy={C} r={DIAL} className="fill-surface-2/70 stroke-border" />
        {Array.from({ length: 24 }, (_, hour) => {
          const major = hour % 6 === 0;
          const [x1, y1] = at(hour, DIAL - (major ? 9 : 5));
          const [x2, y2] = at(hour, DIAL);
          return <line key={`t${hour}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 2 : 1} className="stroke-muted/50" />;
        })}
        {hours.map((count, hour) => {
          const length = count > 0 ? Math.max(6, (count / max) * (OUTER - INNER)) : 0;
          const [x1, y1] = at(hour + 0.5, INNER);
          const [x2, y2] = at(hour + 0.5, INNER + length);
          return count > 0 ? (
            <line
              key={`b${hour}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={8}
              strokeLinecap="round"
              className={hour === peak ? 'stroke-ink' : 'stroke-chart-1/70 hover:stroke-chart-1'}
            >
              <title>{`${pad(hour)}–${pad((hour + 1) % 24)} · ${formatCount(count)} гүйлгээ`}</title>
            </line>
          ) : (
            <circle key={`b${hour}`} cx={x1} cy={y1} r={2} className="fill-muted/30" />
          );
        })}
        <line x1={C} y1={C} x2={handX} y2={handY} strokeWidth={2} strokeLinecap="round" className="stroke-ink" />
        <circle cx={handX} cy={handY} r={4} className="fill-surface stroke-ink" strokeWidth={2} />
        <circle cx={C} cy={C} r={38} className="fill-surface stroke-border" />
        <text x={C} y={C + 2} textAnchor="middle" className="fill-foreground text-[17px] font-semibold tabular-nums">
          {now.text}
        </text>
        <text x={C} y={C + 18} textAnchor="middle" className="fill-muted text-[10px]">
          Одоо
        </text>
        {[0, 6, 12, 18].map((hour) => {
          const [x, y] = at(hour, DIAL + 18);
          return (
            <text key={`l${hour}`} x={x} y={y + 4} textAnchor="middle" className="fill-muted text-[10px] tabular-nums">
              {pad(hour)}
            </text>
          );
        })}
      </svg>
      <DataTable
        caption={label}
        head={['Цаг', 'Гүйлгээ']}
        rows={hours.map((count, hour) => [pad(hour), formatCount(count)])}
      />
    </figure>
  );
}
