import {
  formatPeriodLabel,
  isCurrentPeriod,
  PERIOD_LABELS,
  PERIODS,
  shiftPeriod,
  toISODate,
  type Period,
} from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { Spacing } from '@/constants/theme';

const OPTIONS: readonly SegmentOption<Period>[] = PERIODS.map((value) => ({
  value,
  label: PERIOD_LABELS[value],
}));

type PeriodSwitcherProps = {
  period: Period;
  anchor: string;
  onChange: (period: Period, anchor: string) => void;
};

/** Өдөр / 7 хоног / Сар / Жил tabs and a ‹ label › stepper that stops at the current period. */
export function PeriodSwitcher({ period, anchor, onChange }: PeriodSwitcherProps) {
  const canGoNext = !isCurrentPeriod(period, anchor);

  return (
    <View style={styles.container}>
      <Segmented
        variant="solid"
        options={OPTIONS}
        value={period}
        // A new period type starts from today, as on the overview.
        onChange={(next) => onChange(next, toISODate(new Date()))}
        accessibilityLabel="Хугацаа"
      />
      <View style={styles.stepper}>
        <IconButton glyph="‹" label="Өмнөх" onPress={() => onChange(period, shiftPeriod(period, anchor, -1))} />
        <ThemedText type="smallBold" accessibilityLiveRegion="polite">
          {formatPeriodLabel(period, anchor)}
        </ThemedText>
        <IconButton
          glyph="›"
          label="Дараах"
          disabled={!canGoNext}
          onPress={() => onChange(period, shiftPeriod(period, anchor, 1))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
