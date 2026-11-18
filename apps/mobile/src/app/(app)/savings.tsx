import {
  formatAmount,
  formatRate,
  savingsStatus,
  summarizeSavings,
  toISODate,
  type SavingsCard,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SavingsCardView } from '@/components/savings/savings-card-view';
import { SavingsSummaryCard } from '@/components/savings/savings-summary';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { useSavingsCards } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

const addCard = () => router.push('/savings/edit');

/** The savings tab: every card, with the total above. Kept apart from income and expenses. */
export default function SavingsScreen() {
  const theme = useTheme();
  const { data: cards, error } = useSavingsCards();
  const today = toISODate(new Date());

  return (
    <Screen title="Хадгаламж">
      {error ? (
        <StateMessage
          tone="error"
          icon="⚠️"
          title="Хадгаламжийг ачаалж чадсангүй"
          body="Интернэт холболтоо шалгаад дахин оролдоно уу."
        />
      ) : !cards ? (
        <ActivityIndicator color={theme.accent} />
      ) : cards.length === 0 ? (
        <View style={styles.list}>
          <StateMessage
            icon="🐷"
            title="Хадгаламжийн карт үүсгээгүй байна"
            body="Аялал, байр, яаралтай үеийн мөнгө гэх мэт зорилго бүрт тусдаа карт үүсгээд мөнгөө хуримтлуулаарай. Энэ нь орлого, зарлагаас тусдаа тооцогдоно."
          />
          <Button title="+ Карт үүсгэх" onPress={addCard} />
        </View>
      ) : (
        <>
          <SavingsSummaryCard summary={summarizeSavings(cards, today)} />
          <View style={styles.list}>
            {cards.map((card) => (
              <CardItem key={card.id} card={card} today={today} />
            ))}
          </View>
          <Button title="+ Карт үүсгэх" onPress={addCard} />
        </>
      )}

      <SettingsGroup title="Хэрэгсэл">
        <SettingsRow
          icon="🧮"
          tone="mint"
          label="Хүүгийн тооцоолуур"
          onPress={() => router.push('/savings/calculator')}
        />
      </SettingsGroup>
    </Screen>
  );
}

function CardItem({ card, today }: { card: SavingsCard; today: string }) {
  const status = savingsStatus(card, today);
  const rate = Number(card.annual_rate);

  return (
    <SavingsCardView
      name={card.name}
      icon={card.icon}
      color={card.color}
      caption={card.bank}
      balanceText={formatAmount(status.balance, card.currency)}
      footnote={
        rate > 0
          ? `${formatRate(rate)} · сард +${formatAmount(status.per.month, card.currency)} хүү`
          : undefined
      }
      goal={
        status.goal
          ? {
              progress: status.goal.progress,
              label: `Зорилго ${formatAmount(status.goal.amount, card.currency)} · ${Math.round(status.goal.progress * 100)}%`,
            }
          : null
      }
      accessibilityHint="Дэлгэрэнгүй"
      onPress={() => router.push({ pathname: '/savings/[id]', params: { id: card.id } })}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
});
