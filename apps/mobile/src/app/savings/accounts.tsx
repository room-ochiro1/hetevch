import { summarizeSavings, toISODate } from '@hetevch/shared';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SavingsCard } from '@/components/savings/savings-card';
import { SavingsSummaryCard } from '@/components/savings/savings-summary';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { useSavingsAccounts } from '@/hooks/use-savings';
import { useTheme } from '@/hooks/use-theme';

const addSavings = () => router.push('/savings/edit');

/** Every savings account with its interest so far, and the total they earn per day/month/year. */
export default function SavingsScreen() {
  const theme = useTheme();
  const { data: accounts, error } = useSavingsAccounts();

  return (
    <Page>
      {error ? (
        <StateMessage
          tone="error"
          icon="⚠️"
          title="Хадгаламжийг ачаалж чадсангүй"
          body="Интернэт холболтоо шалгаад дахин оролдоно уу."
        />
      ) : !accounts ? (
        <ActivityIndicator color={theme.accent} />
      ) : accounts.length === 0 ? (
        <View style={styles.list}>
          <StateMessage
            icon="🏦"
            title="Хадгаламж бүртгээгүй байна"
            body="Банкны хадгаламжаа нэмбэл хүү нь өдөр, сар, жилээр хэд болохыг автоматаар тооцож харуулна."
          />
          <Button title="+ Хадгаламж нэмэх" onPress={addSavings} />
        </View>
      ) : (
        <>
          <SavingsSummaryCard summary={summarizeSavings(accounts, toISODate(new Date()))} />
          <View style={styles.list}>
            {accounts.map((account) => (
              <SavingsCard key={account.id} account={account} />
            ))}
          </View>
          <Button title="+ Хадгаламж нэмэх" onPress={addSavings} />
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
    </Page>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
});
