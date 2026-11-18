import { StyleSheet } from 'react-native';

import type { RingSlice } from '@/components/overview/ring-slice';
import { ThemedText } from '@/components/themed-text';
import { useMoney } from '@/hooks/use-money';

type RingCenterProps = {
  /** The tapped segment, or null to show the whole ring's total. */
  slice: RingSlice | null;
  label: string;
  totalText: string;
};

/** The ring's hole: the total, or the tapped segment's name, amount, share and a way in. */
export function RingCenter({ slice, label, totalText }: RingCenterProps) {
  const money = useMoney();

  if (!slice) {
    return (
      <>
        <ThemedText type="caption" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
          {totalText}
        </ThemedText>
      </>
    );
  }

  return (
    <>
      <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
        {slice.icon} {slice.name}
      </ThemedText>
      <ThemedText style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
        {money.format(slice.total)}
      </ThemedText>
      <ThemedText type="caption" themeColor={slice.target ? 'accentText' : 'textSecondary'} numberOfLines={1}>
        {Math.round(slice.share * 100)}%{slice.target ? ' · Хуулга ›' : ''}
      </ThemedText>
    </>
  );
}

const styles = StyleSheet.create({
  total: { fontSize: 26, lineHeight: 32, fontWeight: 700 },
  amount: { fontSize: 22, lineHeight: 28, fontWeight: 700 },
});
