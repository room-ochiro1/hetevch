import { addDays, addMonths, formatLongDate, toISODate } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (iso: string) => void;
};

/**
 * A past (or today's) date: «‹‹ ›› » jump a month, «‹ ›» step a day — a deposit opened months
 * ago is a few taps away. Never goes past today.
 */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const today = toISODate(new Date());
  const clamp = (iso: string) => (iso > today ? today : iso);

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.buttons}>
          <IconButton glyph="«" label="Нэг сарын өмнө" onPress={() => onChange(addMonths(value, -1))} />
          <IconButton glyph="‹" label="Өмнөх өдөр" onPress={() => onChange(addDays(value, -1))} />
        </View>
        <ThemedText type="smallBold" style={styles.value} accessibilityLiveRegion="polite">
          {formatLongDate(value)}
        </ThemedText>
        <View style={styles.buttons}>
          <IconButton
            glyph="›"
            label="Дараагийн өдөр"
            disabled={value >= today}
            onPress={() => onChange(clamp(addDays(value, 1)))}
          />
          <IconButton
            glyph="»"
            label="Нэг сарын дараа"
            disabled={value >= today}
            onPress={() => onChange(clamp(addMonths(value, 1)))}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  value: {
    flex: 1,
    textAlign: 'center',
  },
});
