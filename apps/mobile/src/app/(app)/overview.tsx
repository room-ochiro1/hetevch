import { KIND_LABELS } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { KIND_OPTIONS, openNewTransaction } from '@/components/finance/kind-options';
import { CalendarCard } from '@/components/overview/calendar-card';
import { CategoryRows } from '@/components/overview/category-rows';
import { PeriodCard } from '@/components/overview/period-card';
import { useOverview } from '@/components/overview/use-overview';
import { openStatement } from '@/components/statement/open-statement';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';

/**
 * The overview tab: balance, then where the money went for the chosen kind and period as a
 * ring, then each category with its share. One tap on + (or a category) starts a new entry.
 */
export default function OverviewScreen() {
  const overview = useOverview();
  const kindLabel = KIND_LABELS[overview.kind].toLowerCase();

  return (
    <Screen header={<BalanceHeader balance={overview.balance} />}>
      <Segmented
        options={KIND_OPTIONS}
        value={overview.kind}
        onChange={overview.setKind}
        accessibilityLabel="Зарлага эсвэл орлого"
      />
      <PeriodCard overview={overview} />
      <CalendarCard overview={overview} />

      {overview.error ? (
        <StateMessage
          tone="error"
          icon="⚠️"
          title="Мэдээлэл ачаалж чадсангүй"
          body="Интернэт холболтоо шалгаад доош татаж дахин оролдоно уу."
        />
      ) : !overview.loading && overview.shares.length === 0 && overview.savings.length === 0 ? (
        <View style={styles.empty}>
          <StateMessage
            icon={overview.kind === 'expense' ? '🧾' : '💼'}
            title={`Энэ хугацаанд ${kindLabel} бүртгэгдээгүй байна`}
            body="Юу худалдаж авснаа, хэдэн төгрөг орж ирснийг тэмдэглээд мөнгөө хянаарай."
          />
          <Button
            title={`+ ${KIND_LABELS[overview.kind]} нэмэх`}
            onPress={() => openNewTransaction({ kind: overview.kind })}
          />
        </View>
      ) : (
        <CategoryRows
          shares={overview.shares}
          savings={overview.savings}
          onOpen={(target) =>
            openStatement(target, { kind: overview.kind, period: overview.period, anchor: overview.anchor })
          }
        />
      )}
    </Screen>
  );
}

/** Centered hero figure: the balance the overview leads with. */
function BalanceHeader({ balance }: { balance: number | null }) {
  const money = useMoney();
  return (
    <View style={styles.hero} accessible accessibilityRole="header">
      <ThemedText type="small" themeColor="textSecondary">
        Үлдэгдэл
      </ThemedText>
      <ThemedText style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {balance === null ? '—' : money.net(balance).replace(/^\+/, '')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.half, paddingTop: Spacing.two },
  balance: { fontSize: 40, lineHeight: 48, fontWeight: 700 },
  empty: { gap: Spacing.two },
});
