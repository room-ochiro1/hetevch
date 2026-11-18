import { formatShortDate, type TransactionKind } from '@hetevch/shared';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCellColors } from '@/components/overview/calendar-colors';
import { WEEKDAY_SHORT, type CalendarCell } from '@/components/overview/calendar-data';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

/** Height of the tallest bar; bar heights are proportional to the day's total. */
const BAR_AREA = 72;

type CalendarWeekProps = {
  days: readonly CalendarCell[];
  kind: TransactionKind;
  onSelect: (date: string) => void;
};

/** Monday–Sunday as bars; the day being shown (day period) is highlighted. */
export function CalendarWeek({ days, kind, onSelect }: CalendarWeekProps) {
  const theme = useTheme();
  const colors = useCellColors(kind);
  const money = useMoney();
  const max = Math.max(0, ...days.map((day) => day.total));

  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const height = day.total > 0 && max > 0 ? Math.max(6, (day.total / max) * BAR_AREA) : 4;
        const amount = day.total > 0 ? money.format(day.total) : 'гүйлгээгүй';
        return (
          <Pressable
            key={day.date}
            accessibilityRole="button"
            accessibilityLabel={`${WEEKDAY_SHORT[index]}, ${formatShortDate(day.date)}, ${amount}`}
            accessibilityState={{ selected: day.isSelected, disabled: day.isFuture }}
            disabled={day.isFuture}
            onPress={() => onSelect(day.date)}
            style={({ pressed }) => [
              styles.column,
              day.isSelected && { backgroundColor: theme.backgroundSelected },
              day.isFuture && styles.future,
              pressed && styles.pressed,
            ]}>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: day.total > 0 ? colors.fill(Math.max(day.intensity, 0.5)) : theme.backgroundElement,
                  },
                ]}
              />
            </View>
            <View style={[styles.dot, day.savedColor !== null && { backgroundColor: day.savedColor }]} />
            <ThemedText type="caption" themeColor="textSecondary">
              {WEEKDAY_SHORT[index]}
            </ThemedText>
            <ThemedText type="smallBold" themeColor={day.isToday ? 'accentText' : 'text'} style={styles.date}>
              {day.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.one },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
  barArea: { height: BAR_AREA, width: '62%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  date: { fontVariant: ['tabular-nums'] },
  future: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
