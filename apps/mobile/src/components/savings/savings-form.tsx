import { formatAmount, type SavingsCard } from '@hetevch/shared';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardStyleFields } from '@/components/savings/card-style-fields';
import { InterestFields } from '@/components/savings/interest-fields';
import { SavingsCardView } from '@/components/savings/savings-card-view';
import { useSavingsForm, type SavingsPreset } from '@/components/savings/use-savings-form';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

type SavingsFormProps = { initial?: SavingsCard; preset?: SavingsPreset };

/** Add or edit a card. The card on top is a live preview of what is being filled in. */
export function SavingsForm({ initial, preset }: SavingsFormProps) {
  const form = useSavingsForm(initial, preset);
  const { card, values } = form;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SavingsCardView
          name={card.name}
          icon={card.icon}
          color={card.color}
          caption={form.interest.bank || null}
          balanceText={formatAmount(values.principal, card.currency)}
          goal={
            values.goalAmount
              ? {
                  progress: Math.min(1, values.principal / values.goalAmount),
                  label: `Зорилго ${formatAmount(values.goalAmount, card.currency)}`,
                }
              : null
          }
        />

        <ThemedText type="heading">Карт</ThemedText>
        <CardStyleFields card={card} />

        <ThemedText type="heading">Мөнгө ба хүү</ThemedText>
        <InterestFields interest={form.interest} values={values} currency={card.currency} />

        {form.isEditing ? (
          <Button
            variant="danger"
            title="Картыг устгах"
            onPress={form.confirmDelete}
            loading={form.busy === 'deleting'}
            disabled={form.busy !== null}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {form.error ? (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {form.error}
          </ThemedText>
        ) : null}
        <Button
          title={form.isEditing ? 'Хадгалах' : 'Карт үүсгэх'}
          onPress={form.submit}
          loading={form.busy === 'saving'}
          disabled={form.busy !== null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  footer: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, gap: Spacing.two },
});
