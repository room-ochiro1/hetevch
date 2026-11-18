import { KIND_LABELS, formatNet } from '@hetevch/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppDrawer } from '@/components/drawer/app-drawer';
import { KIND_OPTIONS, openNewTransaction } from '@/components/finance/kind-options';
import { CategoryRows } from '@/components/overview/category-rows';
import { PeriodCard } from '@/components/overview/period-card';
import { useOverview } from '@/components/overview/use-overview';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';

/**
 * The overview: balance, then where the money went for the chosen kind and period as a ring,
 * then each category with its share. One tap on + (or a category) starts a new entry.
 */
export default function HomeScreen() {
  const overview = useOverview();
  const kindLabel = KIND_LABELS[overview.kind].toLowerCase();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Screen header={<BalanceHeader balance={overview.balance} onMenu={() => setMenuOpen(true)} />}>
      <AppDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Segmented
        options={KIND_OPTIONS}
        value={overview.kind}
        onChange={overview.setKind}
        accessibilityLabel="Зарлага эсвэл орлого"
      />
      <PeriodCard overview={overview} />

      {overview.error ? (
        <StateMessage
          tone="error"
          icon="⚠️"
          title="Мэдээлэл ачаалж чадсангүй"
          body="Интернэт холболтоо шалгаад доош татаж дахин оролдоно уу."
        />
      ) : !overview.loading && overview.shares.length === 0 ? (
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
        <CategoryRows shares={overview.shares} kind={overview.kind} />
      )}
    </Screen>
  );
}

type BalanceHeaderProps = { balance: number | null; onMenu: () => void };

/** Centered hero figure: the one number the app leads with; the menu button sits at its left. */
function BalanceHeader({ balance, onMenu }: BalanceHeaderProps) {
  return (
    <View>
      <View style={styles.menu}>
        <IconButton icon="menu" label="Цэс нээх" shape="square" onPress={onMenu} />
      </View>
      <View style={styles.hero} accessible accessibilityRole="header">
        <ThemedText type="small" themeColor="textSecondary">
          Үлдэгдэл
        </ThemedText>
        <ThemedText style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
          {balance === null ? '—' : formatNet(balance).replace(/^\+/, '')}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingTop: Spacing.two,
  },
  balance: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 700,
  },
  empty: {
    gap: Spacing.two,
  },
});
