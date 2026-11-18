import { parseRate } from '@hetevch/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavingsForm } from '@/components/savings/savings-form';
import type { SavingsPreset } from '@/components/savings/use-savings-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { StateMessage } from '@/components/ui/state-message';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSavingsCard } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

/** Positive whole number from a URL param, else undefined. */
function wholeParam(value: string | undefined): number | undefined {
  const number = Number(value);
  return value && Number.isInteger(number) && number > 0 ? number : undefined;
}

/**
 * Add or edit a savings card as a modal sheet. `?id=<uuid>` edits; the calculator opens it
 * with `?principal=&rate=&compounding=&term=&currency=` to save what was just calculated.
 */
export default function SavingsAccountScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    principal?: string;
    rate?: string;
    compounding?: string;
    term?: string;
    currency?: string;
  }>();
  const existing = useSavingsCard(params.id);
  const { compounding, currency } = params;
  const preset: SavingsPreset = {
    principal: wholeParam(params.principal),
    annualRate: params.rate ? (parseRate(params.rate) ?? undefined) : undefined,
    compounding: compounding === 'simple' || compounding === 'monthly' ? compounding : undefined,
    termMonths: wholeParam(params.term),
    currency: currency === 'MNT' || currency === 'USD' ? currency : undefined,
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={styles.container}
        edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { borderColor: theme.border }]}>
            <ThemedText type="heading" accessibilityRole="header">
              {params.id ? 'Карт засах' : 'Шинэ хадгаламжийн карт'}
            </ThemedText>
            <IconButton icon="close" label="Хаах" onPress={() => router.back()} />
          </View>
          <View style={styles.body}>
            {existing.error ? (
              <StateMessage
                tone="error"
                icon="⚠️"
                title="Мэдээлэл ачаалж чадсангүй"
                body="Цонхоо хаагаад дахин оролдоно уу."
              />
            ) : !params.id || existing.data ? (
              <SavingsForm
                key={params.id ?? 'new'}
                initial={existing.data ?? undefined}
                preset={preset}
              />
            ) : (
              <ActivityIndicator color={theme.accent} style={styles.spinner} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  spinner: { paddingVertical: Spacing.six },
});
