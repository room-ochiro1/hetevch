import { KIND_LABELS, PERIOD_LABELS, PERIODS, type Period } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { openNewTransaction } from '@/components/finance/kind-options';
import { DonutChart } from '@/components/overview/donut-chart';
import type { Overview } from '@/components/overview/use-overview';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

const PERIOD_OPTIONS: readonly SegmentOption<Period>[] = PERIODS.map((p) => ({
  value: p,
  label: PERIOD_LABELS[p],
}));

/** Period tabs, a ‹ date › stepper, the category ring with the total inside, and the add button. */
export function PeriodCard({ overview }: { overview: Overview }) {
  const theme = useTheme();
  const kindLabel = KIND_LABELS[overview.kind].toLowerCase();
  const money = useMoney();
  const totalText = overview.loading ? '—' : money.format(overview.total);
  const summary = overview.shares
    .slice(0, 3)
    .map((s) => `${s.category.name} ${Math.round(s.share * 100)}%`)
    .join(', ');

  return (
    <Card style={styles.card}>
      <Segmented
        variant="solid"
        options={PERIOD_OPTIONS}
        value={overview.period}
        onChange={overview.setPeriod}
        accessibilityLabel="Хугацаа"
      />
      <View style={styles.stepper}>
        <IconButton glyph="‹" label="Өмнөх" onPress={overview.previous} />
        <ThemedText type="smallBold" accessibilityLiveRegion="polite">
          {overview.label}
        </ThemedText>
        <IconButton glyph="›" label="Дараах" disabled={!overview.canGoNext} onPress={overview.next} />
      </View>

      <View style={styles.ring}>
        <DonutChart
          segments={overview.segments}
          trackColor={theme.backgroundElement}
          accessibilityLabel={`${overview.label}: нийт ${kindLabel} ${totalText}${summary ? `. ${summary}` : ''}`}>
          <ThemedText type="caption" themeColor="textSecondary">
            Нийт {kindLabel}
          </ThemedText>
          <ThemedText style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
            {totalText}
          </ThemedText>
        </DonutChart>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${KIND_LABELS[overview.kind]} нэмэх`}
        onPress={() => openNewTransaction({ kind: overview.kind })}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.text }, pressed && styles.pressed]}>
        <Text style={[styles.fabGlyph, { color: theme.background }]}>+</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ring: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  total: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  fabGlyph: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: 500,
  },
});
