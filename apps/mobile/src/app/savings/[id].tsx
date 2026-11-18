import { formatAmount, formatRate, savingsStatus, toISODate } from '@hetevch/shared';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CardStats } from '@/components/savings/card-stats';
import { EntryHistory } from '@/components/savings/entry-history';
import { SavingsCardView } from '@/components/savings/savings-card-view';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useSavingsCard } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

/** One savings card: its balance, put money in or take it out, its numbers and history. */
export default function SavingsCardScreen() {
  const theme = useTheme();
  const money = useMoney();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: card, error } = useSavingsCard(id);

  if (error) {
    return (
      <Page>
        <StateMessage
          tone="error"
          icon="⚠️"
          title="Картыг ачаалж чадсангүй"
          body="Интернэт холболтоо шалгаад дахин оролдоно уу."
        />
      </Page>
    );
  }
  if (!card) {
    return (
      <Page>
        <ActivityIndicator color={theme.accent} />
      </Page>
    );
  }

  const status = savingsStatus(card, toISODate(new Date()));
  const rate = Number(card.annual_rate);
  const footnote = [
    rate > 0 ? `+${formatAmount(status.accrued, card.currency)} хүү · ${formatRate(rate)}` : null,
    // A dollar card shown to someone viewing in tögrög (or the reverse) also gets its value there.
    card.currency !== money.currency && money.convert(status.balance, card.currency) !== null
      ? `≈ ${money.format(status.balance, card.currency)}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const move = (type: 'in' | 'out') =>
    router.push({ pathname: '/savings/entry', params: { accountId: card.id, type } });

  return (
    <Page>
      <Stack.Screen options={{ title: card.name }} />
      <SavingsCardView
        name={card.name}
        icon={card.icon}
        color={card.color}
        caption={card.bank}
        balanceText={formatAmount(status.balance, card.currency)}
        footnote={footnote || undefined}
        goal={
          status.goal
            ? {
                progress: status.goal.progress,
                label: `Зорилго ${formatAmount(status.goal.amount, card.currency)} · ${Math.round(status.goal.progress * 100)}%`,
              }
            : null
        }
      />
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button title="+ Мөнгө хийх" onPress={() => move('in')} />
        </View>
        <View style={styles.action}>
          <Button
            variant="secondary"
            title="− Мөнгө авах"
            disabled={status.balance <= 0}
            onPress={() => move('out')}
          />
        </View>
      </View>
      <CardStats card={card} status={status} />
      <EntryHistory card={card} />
      <Button
        variant="secondary"
        title="Картыг засах"
        onPress={() => router.push({ pathname: '/savings/edit', params: { id: card.id } })}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.three },
  action: { flex: 1 },
});
