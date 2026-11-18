import { formatMonthLabel, isSameMonth, monthOf, shiftMonth, type MonthKey } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';

type MonthSwitcherProps = {
  month: MonthKey;
  onChange: (month: MonthKey) => void;
};

/** ‹ 2026 оны 11-р сар › — cannot move past the current month. */
export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const isCurrent = isSameMonth(month, monthOf(new Date()));

  return (
    <View style={styles.row}>
      <IconButton glyph="‹" label="Өмнөх сар" onPress={() => onChange(shiftMonth(month, -1))} />
      <ThemedText type="smallBold" accessibilityLiveRegion="polite">
        {formatMonthLabel(month)}
      </ThemedText>
      <IconButton
        glyph="›"
        label="Дараагийн сар"
        disabled={isCurrent}
        onPress={() => onChange(shiftMonth(month, 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
