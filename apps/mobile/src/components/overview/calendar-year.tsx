import type { TransactionKind } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCellColors } from '@/components/overview/calendar-colors';
import type { CalendarCell } from '@/components/overview/calendar-data';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';

const PER_ROW = 4;

type CalendarYearProps = {
  months: readonly CalendarCell[];
  kind: TransactionKind;
  onSelect: (date: string) => void;
};

/** Twelve month tiles, four to a row, each with its total and tinted by it. */
export function CalendarYear({ months, kind, onSelect }: CalendarYearProps) {
  const colors = useCellColors(kind);
  const money = useMoney();
  const rows = Array.from({ length: months.length / PER_ROW }, (_, i) =>
    months.slice(i * PER_ROW, i * PER_ROW + PER_ROW),
  );

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0]?.date} style={styles.row}>
          {row.map((month) => {
            const ink = colors.ink(month.intensity);
            const amount = month.total > 0 ? money.format(month.total) : '—';
            return (
              <Pressable
                key={month.date}
                accessibilityRole="button"
                accessibilityLabel={`${month.label}, ${month.total > 0 ? amount : 'гүйлгээгүй'}`}
                accessibilityState={{ disabled: month.isFuture }}
                disabled={month.isFuture}
                onPress={() => onSelect(month.date)}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: colors.fill(month.intensity) },
                  month.isToday && { borderWidth: 2, borderColor: colors.today },
                  month.isFuture && styles.future,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.month, { color: ink }]}>{month.label}</Text>
                <Text style={[styles.amount, { color: ink }]} numberOfLines={1} adjustsFontSizeToFit>
                  {amount}
                </Text>
                {month.savedColor ? <View style={[styles.dot, { backgroundColor: month.savedColor }]} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  tile: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'space-between',
    padding: Spacing.two,
    borderRadius: Radius.medium,
  },
  month: { fontSize: 12, fontWeight: 600, opacity: 0.85 },
  amount: { fontSize: 13, fontWeight: 700, fontVariant: ['tabular-nums'] },
  dot: { position: 'absolute', top: 8, right: 8, width: 5, height: 5, borderRadius: 3 },
  future: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
