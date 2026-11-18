import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';

type ShareRowProps = {
  icon: string;
  /** Stored color for the icon tile (mapped per theme by CategoryIcon). */
  iconColor: string;
  /** Display color of the bar, same as the ring slice. */
  barColor: string;
  name: string;
  total: number;
  /** 0–1 of the ring. */
  share: number;
  onPress: () => void;
  accessibilityHint: string;
};

/** One legend line under the ring: icon, name, amount, percent and a bar in the slice color. */
export function ShareRow(props: ShareRowProps) {
  const theme = useTheme();
  const money = useMoney();
  const percent = Math.round(props.share * 100);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${props.name}: ${money.format(props.total)}, ${percent} хувь`}
      accessibilityHint={props.accessibilityHint}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.backgroundElement : theme.surface },
      ]}>
      <CategoryIcon category={{ icon: props.icon, color: props.iconColor }} size={42} />
      <View style={styles.body}>
        <View style={styles.line}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
            {props.name}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.tabular}>
            {money.format(props.total)}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.percent}>
            {percent}%
          </ThemedText>
        </View>
        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.fill,
              { width: `${Math.max(props.share * 100, 2)}%`, backgroundColor: props.barColor },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  body: { flex: 1, gap: Spacing.two },
  line: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  name: { flex: 1 },
  tabular: { fontVariant: ['tabular-nums'] },
  percent: { width: 36, textAlign: 'right', fontVariant: ['tabular-nums'] },
  track: { height: 4, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
