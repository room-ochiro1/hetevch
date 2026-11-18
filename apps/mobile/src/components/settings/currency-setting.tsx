import {
  CURRENCIES,
  CURRENCY_INFO,
  formatAmount,
  formatShortDate,
  toISODate,
  type Currency,
} from '@hetevch/shared';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RATE_SOURCE } from '@/lib/exchange-rate';
import { useCurrency } from '@/providers/currency';

const OPTIONS: readonly SegmentOption<Currency>[] = CURRENCIES.map((currency) => ({
  value: currency,
  label: `${CURRENCY_INFO[currency].symbol} ${CURRENCY_INFO[currency].label}`,
}));

/** Tögrög (default) or dollars for showing amounts, with the rate that converts them. */
export function CurrencySetting() {
  const theme = useTheme();
  const { preference, setPreference, rate } = useCurrency();

  const status = rate
    ? `Ханш (${formatShortDate(toISODate(new Date(rate.updatedAt)))}): 1 $ = ${formatAmount(Math.round(rate.value), 'MNT')}.`
    : preference === 'USD'
      ? 'Ханш татаж чадсангүй: интернэтэд холбогдмогц доллараар харагдана.'
      : '';

  return (
    <View style={styles.block}>
      <SettingsGroup title="Тохиргоо">
        <SettingsRow icon="💵" tone="peach" label="Мөнгөн тэмдэгт">
          <Segmented
            options={OPTIONS}
            value={preference}
            onChange={setPreference}
            accessibilityLabel="Мөнгөн тэмдэгт"
          />
        </SettingsRow>
      </SettingsGroup>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.footer}>
        Гүйлгээ төгрөгөөр хадгалагдаж, сонгосон мөнгөн тэмдэгтээр харагдана. {status}
        {rate ? (
          <>
            {' '}
            <Text
              accessibilityRole="link"
              style={{ color: theme.accentText }}
              onPress={() => Linking.openURL(RATE_SOURCE.url)}>
              Эх сурвалж: {RATE_SOURCE.name}
            </Text>
          </>
        ) : null}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.one,
  },
});
