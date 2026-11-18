import { KIND_LABELS } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { useCellColors } from '@/components/overview/calendar-colors';
import type { CalendarCell } from '@/components/overview/calendar-data';
import { CalendarMonth } from '@/components/overview/calendar-month';
import { CalendarWeek } from '@/components/overview/calendar-week';
import { CalendarYear } from '@/components/overview/calendar-year';
import type { Overview } from '@/components/overview/use-overview';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

/**
 * The calendar under the ring, following the period tabs: a month grid for Сар, the week's
 * bars for 7 хоног and Өдөр, month tiles for Жил. Tapping a day or month opens it above.
 */
export function CalendarCard({ overview }: { overview: Overview }) {
  const { calendar, kind } = overview;
  const byMonth = calendar.view === 'year';
  const cells: readonly (CalendarCell | null)[] =
    calendar.view === 'month' ? calendar.weeks.flat() : calendar.view === 'week' ? calendar.days : calendar.months;
  // The legend's dot takes the first saved cell's card colour.
  const savingsColor = cells.find((cell) => cell?.savedColor)?.savedColor ?? null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <ThemedText type="smallBold" accessibilityRole="header">
            {byMonth ? 'Сар бүрийн' : 'Өдөр бүрийн'} {KIND_LABELS[kind].toLowerCase()}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {byMonth ? 'Сар дээр дарж задална' : 'Өдөр дээр дарж задална'}
          </ThemedText>
        </View>
        <Legend kind={kind} savingsColor={savingsColor} />
      </View>

      {calendar.view === 'month' ? (
        <CalendarMonth weeks={calendar.weeks} kind={kind} onSelect={overview.openDay} />
      ) : calendar.view === 'week' ? (
        <CalendarWeek days={calendar.days} kind={kind} onSelect={overview.openDay} />
      ) : (
        <CalendarYear months={calendar.months} kind={kind} onSelect={overview.openMonth} />
      )}
    </Card>
  );
}

/** "Бага ▢▢▢▢ Их", plus a savings dot when any cell has one. Decorative for screen readers. */
function Legend({ kind, savingsColor }: { kind: Overview['kind']; savingsColor: string | null }) {
  const colors = useCellColors(kind);

  return (
    <View style={styles.legend} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.scale}>
        <ThemedText type="caption" themeColor="textSecondary">
          Бага
        </ThemedText>
        {[0.15, 0.45, 0.75, 1].map((step) => (
          <View key={step} style={[styles.swatch, { backgroundColor: colors.fill(step) }]} />
        ))}
        <ThemedText type="caption" themeColor="textSecondary">
          Их
        </ThemedText>
      </View>
      {savingsColor ? (
        <View style={styles.scale}>
          <View style={[styles.dot, { backgroundColor: savingsColor }]} />
          <ThemedText type="caption" themeColor="textSecondary">
            Хадгаламж
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  titles: { flexShrink: 1, gap: Spacing.half },
  legend: { alignItems: 'flex-end', gap: Spacing.one },
  scale: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
