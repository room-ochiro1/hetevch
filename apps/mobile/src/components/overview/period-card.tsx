import { KIND_LABELS, PERIOD_LABELS, PERIODS, type Period } from '@hetevch/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { openNewTransaction } from '@/components/finance/kind-options';
import { DonutChart } from '@/components/overview/donut-chart';
import { RingCenter } from '@/components/overview/ring-center';
import { describeSlice } from '@/components/overview/ring-slice';
import type { Overview } from '@/components/overview/use-overview';
import { openStatement } from '@/components/statement/open-statement';
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

/**
 * Period tabs, a ‹ date › stepper, the category ring with the total inside, and the add button.
 * Tapping a ring color shows that slice in the center; tapping the center opens its statement.
 */
export function PeriodCard({ overview }: { overview: Overview }) {
  const theme = useTheme();
  const kindLabel = KIND_LABELS[overview.kind].toLowerCase();
  const money = useMoney();
  const totalText = overview.loading ? '—' : money.format(overview.total);
  // With savings in the ring, the center sums both so it matches the slices and percents.
  const centerLabel = overview.savings.length > 0 ? 'Зарлага + хадгаламж' : `Нийт ${kindLabel}`;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // A key from another period or kind that is no longer on the ring shows the total again.
  const slice = selectedKey ? describeSlice(overview, selectedKey) : null;
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
          accessibilityLabel={`${overview.label}: ${centerLabel.toLowerCase()} ${totalText}${summary ? `. ${summary}` : ''}`}
          selectedKey={slice ? selectedKey : null}
          onSelect={setSelectedKey}
          onPressCenter={() => {
            if (!slice?.target) return;
            const { kind, period, anchor } = overview;
            openStatement(slice.target, { kind, period, anchor });
          }}>
          <RingCenter slice={slice} label={centerLabel} totalText={totalText} />
        </DonutChart>
        {overview.segments.length > 0 ? (
          <ThemedText type="caption" themeColor="textSecondary" style={styles.hint}>
            {slice ? 'Голд нь дарж хуулга нээнэ' : 'Өнгө дээр дарж задална'}
          </ThemedText>
        ) : null}
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
  hint: {
    marginTop: Spacing.two,
    // Clear of the + button in the card's corner, even on narrow phones.
    paddingHorizontal: 64,
    textAlign: 'center',
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
