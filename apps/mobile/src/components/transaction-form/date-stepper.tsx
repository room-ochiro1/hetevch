import { addDays, formatDayLabel, toISODate } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DateStepperProps = {
  value: string;
  onChange: (iso: string) => void;
};

/** ‹ Өнөөдөр › — steps a day at a time; future days are not allowed. */
export function DateStepper({ value, onChange }: DateStepperProps) {
  const theme = useTheme();
  const isToday = value >= toISODate(new Date());

  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <IconButton glyph="‹" label="Өмнөх өдөр" onPress={() => onChange(addDays(value, -1))} />
      <ThemedText type="smallBold" accessibilityLiveRegion="polite">
        {formatDayLabel(value)}
      </ThemedText>
      <IconButton
        glyph="›"
        label="Дараагийн өдөр"
        disabled={isToday}
        onPress={() => onChange(addDays(value, 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
