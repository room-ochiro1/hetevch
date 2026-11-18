import { StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/finance/category-icon';
import type { MoneyMove } from '@/components/finance/money-moves';
import { TransactionsBody } from '@/components/finance/transactions-body';
import type { StatementTile } from '@/components/statement/statement-tiles';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { QueryResult } from '@/hooks/use-supabase-query';

export type StatementViewProps = {
  icon: string;
  /** Stored color for the icon tile. */
  iconColor: string;
  title: string;
  totalText: string;
  totalTone: ThemeColor;
  /** One line under the total, e.g. "Нийт зарлагын 12%". */
  caption: string | null;
  tiles: readonly StatementTile[];
  items: QueryResult<MoneyMove[]>;
  emptyTitle: string;
  addLabel: string;
  onAdd: () => void;
};

/**
 * A bank-statement page for one category or for savings: the period's total with a few key
 * numbers, then every movement grouped by day (tap one to edit it), and a quick add.
 */
export function StatementView(props: StatementViewProps) {
  const theme = useTheme();

  return (
    <>
      <Card style={styles.hero}>
        <View style={styles.identity}>
          <CategoryIcon category={{ icon: props.icon, color: props.iconColor }} size={56} />
          <View style={styles.titles}>
            <ThemedText type="heading" numberOfLines={1}>
              {props.title}
            </ThemedText>
            {props.caption ? (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {props.caption}
              </ThemedText>
            ) : null}
          </View>
        </View>
        <ThemedText
          themeColor={props.totalTone}
          style={styles.total}
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityLabel={`Нийт ${props.totalText}`}>
          {props.totalText}
        </ThemedText>
        <View style={[styles.tiles, { borderColor: theme.border }]}>
          {props.tiles.map((tile, index) => (
            <View
              key={tile.label}
              accessible
              accessibilityLabel={`${tile.label}: ${tile.value}`}
              style={[
                styles.tile,
                index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
              ]}>
              <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                {tile.label}
              </ThemedText>
              <ThemedText type="smallBold" themeColor={tile.tone ?? 'text'} numberOfLines={1} adjustsFontSizeToFit>
                {tile.value}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <Button title={props.addLabel} variant="secondary" onPress={props.onAdd} />

      <ThemedText type="smallBold" themeColor="textSecondary" accessibilityRole="header" style={styles.section}>
        Хуулга
      </ThemedText>
      <TransactionsBody result={props.items} grouped emptyTitle={props.emptyTitle} />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.three },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  titles: { flex: 1, gap: Spacing.half },
  total: { fontSize: 32, lineHeight: 40, fontWeight: 700, fontVariant: ['tabular-nums'] },
  tiles: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  tile: { flex: 1, alignItems: 'center', gap: Spacing.half, paddingHorizontal: Spacing.one },
  section: { paddingHorizontal: Spacing.one },
});
