import { CURRENCIES, CURRENCY_INFO, type Currency } from '@hetevch/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SavingsFormState } from '@/components/savings/use-savings-form';
import { ThemedText } from '@/components/themed-text';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { CARD_COLORS, CARD_COLOR_KEYS, CARD_ICONS, type CardColor } from '@/constants/savings-appearance';
import { useTheme } from '@/hooks/use-theme';

const COLOR_NAMES: Record<CardColor, string> = {
  indigo: 'Хөх ягаан',
  emerald: 'Ногоон',
  sky: 'Цэнхэр',
  rose: 'Улаан ягаан',
  amber: 'Шаргал',
  violet: 'Нил ягаан',
  teal: 'Оюу',
  slate: 'Саарал',
};

const CURRENCY_OPTIONS: readonly SegmentOption<Currency>[] = CURRENCIES.map((currency) => ({
  value: currency,
  label: `${CURRENCY_INFO[currency].symbol} ${CURRENCY_INFO[currency].label}`,
}));

/** What the card is and how it looks: name, colour, picture, currency and goal. */
export function CardStyleFields({ card }: { card: SavingsFormState['card'] }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <TextField
        label="Картын нэр"
        value={card.name}
        onChangeText={card.setName}
        placeholder="Жишээ нь: Аяллын мөнгө"
        maxLength={60}
      />

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Өнгө
        </ThemedText>
        <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Картын өнгө">
          {CARD_COLOR_KEYS.map((key) => {
            const selected = card.color === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="radio"
                accessibilityLabel={COLOR_NAMES[key]}
                accessibilityState={{ selected }}
                onPress={() => card.setColor(key)}
                style={[styles.swatchRing, { borderColor: selected ? theme.text : 'transparent' }]}>
                <View style={[styles.swatch, { backgroundColor: CARD_COLORS[key] }]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Дүрс
        </ThemedText>
        <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Картын дүрс">
          {CARD_ICONS.map((icon) => {
            const selected = card.icon === icon;
            return (
              <Pressable
                key={icon}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => card.setIcon(icon)}
                style={[
                  styles.iconTile,
                  {
                    backgroundColor: selected ? theme.accentSoft : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}>
                <Text style={styles.icon}>{icon}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Мөнгөн тэмдэгт
        </ThemedText>
        <Segmented
          options={CURRENCY_OPTIONS}
          value={card.currency}
          onChange={card.setCurrency}
          accessibilityLabel="Картын мөнгөн тэмдэгт"
        />
      </View>

      <TextField
        label={`Зорилго (${CURRENCY_INFO[card.currency].symbol}, заавал биш)`}
        value={card.goalText}
        onChangeText={card.setGoalText}
        placeholder="Жишээ нь: 3,000,000"
        keyboardType="decimal-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.four },
  field: { gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  swatchRing: { padding: 3, borderRadius: Radius.pill, borderWidth: 2 },
  swatch: { width: 32, height: 32, borderRadius: Radius.pill },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22, lineHeight: 28 },
});
