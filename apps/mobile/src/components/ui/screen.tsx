import { useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFinanceData } from '@/providers/finance-data';

type ScreenProps = {
  title?: string;
  /** Small line above the title, e.g. a greeting. */
  eyebrow?: string;
  /** Right side of the header, e.g. an add button. */
  action?: ReactNode;
  /** Replaces the default title row entirely (the home screen's greeting). */
  header?: ReactNode;
  children: ReactNode;
};

/**
 * Layout shared by the tab screens: safe area, a title row, scrolling content limited to
 * `MaxContentWidth`, bottom padding for the tab bar, and pull-to-refresh for finance data.
 */
export function Screen({ title, eyebrow, action, header, children }: ScreenProps) {
  const theme = useTheme();
  const { invalidate } = useFinanceData();
  const [refreshing, setRefreshing] = useState(false);

  /** Keeps the spinner up until every reloaded query has answered, so the refresh is visible. */
  function refresh() {
    setRefreshing(true);
    invalidate().finally(() => setRefreshing(false));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} />
          }>
          {header ?? (
            <View style={styles.header}>
              <View style={styles.titles}>
                {eyebrow ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {eyebrow}
                  </ThemedText>
                ) : null}
                <ThemedText type="subtitle" accessibilityRole="header">
                  {title}
                </ThemedText>
              </View>
              {action}
            </View>
          )}
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  titles: {
    flex: 1,
    gap: Spacing.half,
  },
});
