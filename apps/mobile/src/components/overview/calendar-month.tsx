import { formatShortDate, type TransactionKind } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCellColors } from '@/components/overview/calendar-colors';
import { WEEKDAY_SHORT, type CalendarCell } from '@/components/overview/calendar-data';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';

type CalendarMonthProps = {
  weeks: readonly (CalendarCell | null)[][];
  kind: TransactionKind;
  onSelect: (date: string) => void;
};

/** A Monday-first month grid; each day is tinted by how much moved that day. */
export function CalendarMonth({ weeks, kind, onSelect }: CalendarMonthProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {WEEKDAY_SHORT.map((day) => (
          <ThemedText key={day} type="caption" themeColor="textSecondary" style={styles.weekday}>
            {day}
          </ThemedText>
        ))}
      </View>
      {weeks.map((week, index) => (
        <View key={week.find(Boolean)?.date ?? index} style={styles.row}>
          {week.map((cell, slot) =>
            cell ? (
              <DayCell key={cell.date} cell={cell} kind={kind} onSelect={onSelect} />
            ) : (
              <View key={`blank-${slot}`} style={styles.cell} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

function DayCell({ cell, kind, onSelect }: { cell: CalendarCell; kind: TransactionKind; onSelect: (date: string) => void }) {
  const colors = useCellColors(kind);
  const money = useMoney();
  const amount = cell.total > 0 ? money.format(cell.total) : 'гүйлгээгүй';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${formatShortDate(cell.date)}, ${amount}${cell.savedColor ? ', хадгаламж' : ''}`}
      accessibilityState={{ disabled: cell.isFuture }}
      disabled={cell.isFuture}
      onPress={() => onSelect(cell.date)}
      style={({ pressed }) => [
        styles.cell,
        styles.day,
        { backgroundColor: colors.fill(cell.intensity) },
        cell.isToday && { borderWidth: 2, borderColor: colors.today },
        cell.isFuture && styles.future,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, { color: colors.ink(cell.intensity) }]}>{cell.label}</Text>
      {cell.savedColor ? <View style={[styles.dot, { backgroundColor: cell.savedColor }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.one + Spacing.half },
  row: { flexDirection: 'row', gap: Spacing.one + Spacing.half },
  weekday: { flex: 1, textAlign: 'center' },
  cell: { flex: 1, aspectRatio: 1 },
  day: { borderRadius: Radius.small, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: 600, fontVariant: ['tabular-nums'] },
  dot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3 },
  future: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
