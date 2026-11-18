import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

/**
 * Five tabs with home in the middle (index.tsx is the tab the app opens on): profile and
 * savings on the left, the overview and the transaction list on the right.
 */
export default function AppTabsLayout() {
  const colors = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.accentSoft}
      tintColor={colors.accentText}
      labelStyle={{ selected: { color: colors.accentText } }}>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Профайл</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="savings">
        <NativeTabs.Trigger.Label>Хадгаламж</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'wallet.bifold', selected: 'wallet.bifold.fill' }}
          md="account_balance_wallet"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Нүүр</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="overview">
        <NativeTabs.Trigger.Label>Тойм</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }} md="pie_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="transactions">
        <NativeTabs.Trigger.Label>Гүйлгээ</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }}
          md="receipt_long"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
