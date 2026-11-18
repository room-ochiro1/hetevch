import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { ON_CARD, ON_CARD_SOFT, cardColor } from '@/constants/savings-appearance';

type SavingsCardViewProps = {
  name: string;
  icon: string;
  color: string;
  /** Small line under the name, e.g. the bank. */
  caption?: string | null;
  balanceText: string;
  /** Bottom line, e.g. "+12,000 ₮ хүү · 12.5%". */
  footnote?: string;
  goal?: { progress: number; label: string } | null;
  onPress?: () => void;
  accessibilityHint?: string;
};

/** A savings card drawn like a bank card in the colour the user picked. */
export function SavingsCardView(props: SavingsCardViewProps) {
  const { name, icon, color, caption, balanceText, footnote, goal, onPress } = props;

  const body = (
    <View
      style={[styles.card, { backgroundColor: cardColor(color) }]}>
      <View style={[styles.circle, styles.circleBig]} />
      <View style={[styles.circle, styles.circleSmall]} />

      <View style={styles.top}>
        <View style={styles.iconTile}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.titles}>
          <Text style={styles.name} numberOfLines={1}>
            {name || 'Хадгаламж'}
          </Text>
          {caption ? (
            <Text style={styles.caption} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {balanceText}
      </Text>

      {goal ? (
        <View style={styles.goal}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(goal.progress * 100)}%` }]} />
          </View>
          <Text style={styles.caption} numberOfLines={1}>
            {goal.label}
          </Text>
        </View>
      ) : null}
      {footnote ? (
        <Text style={styles.caption} numberOfLines={1}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${balanceText}`}
      accessibilityHint={props.accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large + 4,
    padding: Spacing.four,
    gap: Spacing.three,
    minHeight: 180,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  circleBig: { width: 220, height: 220, top: -90, right: -70 },
  circleSmall: { width: 120, height: 120, bottom: -50, right: 40 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22, lineHeight: 28 },
  titles: { flex: 1, gap: 2 },
  name: { color: ON_CARD, fontSize: 17, fontWeight: 700 },
  caption: { color: ON_CARD_SOFT, fontSize: 13, fontWeight: 600 },
  balance: {
    color: ON_CARD,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
    marginTop: 'auto',
  },
  goal: { gap: Spacing.one },
  track: { height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.28)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: ON_CARD },
});
