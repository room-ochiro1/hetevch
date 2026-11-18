import { INTEREST_TAX_RATE, formatMoney, formatRate } from '@hetevch/shared';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { CalculatorResult } from '@/components/savings/use-calculator';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const money = (value: number) => formatMoney(Math.round(value));

/** The answer first (final amount), then how it splits, then the per-period figures. */
export function CalculatorResults({ result }: { result: CalculatorResult }) {
  const theme = useTheme();
  const interestShare = result.balance > 0 ? result.interest / result.balance : 0;

  function saveAsDeposit() {
    router.push({
      pathname: '/savings/edit',
      params: {
        principal: String(Math.round(result.principal)),
        rate: String(result.annualRate),
        compounding: result.compounding,
        ...(result.termMonths ? { term: String(result.termMonths) } : {}),
      },
    });
  }

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Card tone="lavender" style={styles.hero}>
        <ThemedText type="small" themeColor="lavenderInk">
          Хугацааны эцэст
        </ThemedText>
        <ThemedText type="display" numberOfLines={1} adjustsFontSizeToFit>
          {money(result.balance)}
        </ThemedText>
        <View
          style={[styles.bar, { backgroundColor: theme.accent }]}
          accessibilityLabel={`Үндсэн дүн ${money(result.principal)}, хүү ${money(result.interest)}`}>
          <View
            style={[
              styles.barInterest,
              { width: `${interestShare * 100}%`, backgroundColor: theme.income },
            ]}
          />
        </View>
        <View style={styles.legend}>
          <ThemedText type="caption" themeColor="textSecondary">
            ■ Үндсэн дүн {money(result.principal)}
          </ThemedText>
          <ThemedText type="caption" themeColor="income">
            ■ Хүү +{money(result.interest)}
          </ThemedText>
        </View>
      </Card>

      <SettingsGroup
        title="Хүүгийн орлого"
        footer={`Өдрийн хүүг жилийн хүү ÷ 365, сарынхыг ÷ 12 гэж тооцов. ${INTEREST_TAX_RATE * 100}% татвар болон хүү бодох журам банк, бүтээгдэхүүнээс хамаарч өөр байж болно.`}>
        <SettingsRow icon="☀️" tone="peach" label="Өдөрт" value={`+${money(result.per.day)}`} />
        <SettingsRow icon="🗓️" tone="mint" label="Сард" value={`+${money(result.per.month)}`} />
        <SettingsRow icon="📈" tone="lavender" label="Жилд" value={`+${money(result.per.year)}`} />
        <SettingsRow
          icon="🧾"
          tone="accent"
          label={`Татварын дараа (−${INTEREST_TAX_RATE * 100}%)`}
          value={`+${money(result.net)}`}
        />
        {result.compounding === 'monthly' ? (
          <SettingsRow
            icon="％"
            tone="mint"
            label="Бодит жилийн хүү"
            value={formatRate(result.effectiveRate)}
          />
        ) : null}
      </SettingsGroup>

      <Button variant="secondary" title="Хадгаламж болгон нэмэх" onPress={saveAsDeposit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  hero: { padding: Spacing.four, gap: Spacing.two },
  bar: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.two,
  },
  barInterest: { height: '100%' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two, flexWrap: 'wrap' },
});
