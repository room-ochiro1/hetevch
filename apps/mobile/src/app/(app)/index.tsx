import { formatAmount, parseAmount } from '@hetevch/shared';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/drawer/app-drawer';
import { openNewTransaction } from '@/components/finance/kind-options';
import { AmountDisplay } from '@/components/home/amount-display';
import { HomeActions } from '@/components/home/home-actions';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { Keypad } from '@/components/home/keypad';
import { useAmountPad } from '@/components/home/use-amount-pad';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';

/**
 * Home is a number pad: type how much, then say what it was (Зарлага / Орлого). The sheet that
 * opens only asks for the category, so logging takes a few taps. The avatar opens the side menu.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const money = useMoney();
  const pad = useAmountPad(money.currency === 'USD');
  const [menuOpen, setMenuOpen] = useState(false);
  const typed = parseAmount(pad.text);

  const hint = pad.isEmpty
    ? 'Дүнгээ бичээд Зарлага эсвэл Орлого дарна уу'
    : money.currency !== 'MNT' && typed !== null
      ? `≈ ${formatAmount(Math.round(money.toBase(typed)), 'MNT')}`
      : undefined;

  /** Hand the amount over and start fresh for the next one. */
  function use(open: (amount: string | undefined) => void) {
    open(pad.isEmpty ? undefined : pad.text);
    pad.clear();
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <View
          style={[
            styles.content,
            // iOS draws the tab bar over the screen; Android lays the screen out above it.
            { paddingBottom: Platform.OS === 'ios' ? BottomTabInset + insets.bottom : Spacing.three },
          ]}>
          <HomeTopBar onOpenMenu={() => setMenuOpen(true)} />
          <View style={styles.display}>
            <AmountDisplay text={pad.text} symbol={money.symbol} hint={hint} />
          </View>
          <Keypad onKey={pad.press} onClear={pad.clear} decimal={money.currency === 'USD'} />
          <HomeActions
            onExpense={() => use((amount) => openNewTransaction({ kind: 'expense', amount }))}
            onIncome={() => use((amount) => openNewTransaction({ kind: 'income', amount }))}
          />
        </View>
      </SafeAreaView>
      <AppDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  display: { flex: 1, justifyContent: 'center' },
});
