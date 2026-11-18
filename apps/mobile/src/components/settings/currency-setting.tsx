import {
  CURRENCY_INFO,
  DISPLAY_CURRENCIES,
  formatAmount,
  formatShortDate,
  roundAmount,
  toISODate,
  type DisplayCurrency,
} from '@hetevch/shared';
import type { ReactNode } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChips, type ChipOption } from '@/components/ui/choice-chips';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RATE_SOURCE, type Rates } from '@/lib/exchange-rate';
import { useCurrency } from '@/providers/currency';

const OPTIONS: readonly ChipOption<DisplayCurrency>[] = DISPLAY_CURRENCIES.map((currency) => ({
  value: currency,
  label: `${CURRENCY_INFO[currency].symbol} ${CURRENCY_INFO[currency].label}`,
}));

/**
 * The "Тохиргоо" group: which of the 11 currencies amounts are shown in (tögrög by default),
 * with the rate that converts them. `children` are extra rows shown above it in the same group.
 */
export function CurrencySetting({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  const { preference, setPreference, rates } = useCurrency();

  const status = rates
    ? rateLine(rates, preference)
    : preference !== 'MNT'
      ? `Ханш татаж чадсангүй: интернэтэд холбогдмогц ${CURRENCY_INFO[preference].label.toLowerCase()}аар харагдана.`
      : '';

  return (
    <View style={styles.block}>
      <SettingsGroup title="Тохиргоо">
        {children}
        <SettingsRow icon="💵" tone="peach" label="Мөнгөн тэмдэгт">
          <ChoiceChips
            options={OPTIONS}
            value={preference}
            onChange={setPreference}
            accessibilityLabel="Мөнгөн тэмдэгт"
          />
        </SettingsRow>
      </SettingsGroup>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.footer}>
        Гүйлгээ төгрөгөөр хадгалагдаж, сонгосон мөнгөн тэмдэгтээр харагдана. {status}
        {rates ? (
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

/** "Ханш (11-р сарын 18): 1 ₩ = 2.7 ₮.": the chosen currency's rate (the dollar's for tögrög). */
function rateLine(rates: Rates, preference: DisplayCurrency): string {
  const shown = preference === 'MNT' ? 'USD' : preference;
  const tugrik = rates.perUsd.MNT / rates.perUsd[shown];
  const value = formatAmount(tugrik < 100 ? roundAmount(tugrik) : Math.round(tugrik), 'MNT');
  const day = formatShortDate(toISODate(new Date(rates.updatedAt)));
  return `Ханш (${day}): 1 ${CURRENCY_INFO[shown].symbol} = ${value}.`;
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.one,
  },
});
