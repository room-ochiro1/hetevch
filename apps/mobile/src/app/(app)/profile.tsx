import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { CurrencySetting } from '@/components/settings/currency-setting';
import { IdentityCard } from '@/components/settings/identity-card';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { APP_VERSION, SUPPORT_EMAIL, contactSupport } from '@/constants/app-info';
import { useProfile } from '@/hooks/use-profile';

/**
 * Account, preferences, help and legal, grouped the way phone settings are. There is no sign
 * out: the phone itself is the account (deleting it is in Хувийн мэдээлэл).
 */
export default function ProfileScreen() {
  const { data: profile, error } = useProfile();

  return (
    <Screen title="Профайл">
      <IdentityCard profile={profile} onPress={() => router.push('/settings/account')} />
      {error ? (
        <StateMessage tone="error" icon="⚠️" title="Профайлыг ачаалж чадсангүй" body={error} />
      ) : null}

      <SettingsGroup title="Бүртгэл">
        <SettingsRow
          icon="👤"
          tone="lavender"
          label="Хувийн мэдээлэл"
          onPress={() => router.push('/settings/account')}
        />
      </SettingsGroup>

      <SettingsGroup title="Санхүү">
        <SettingsRow
          icon="🏷️"
          tone="peach"
          label="Миний ангилал"
          onPress={() => router.push('/settings/categories')}
        />
      </SettingsGroup>

      <CurrencySetting />

      <SettingsGroup title="Тусламж">
        <SettingsRow
          icon="💬"
          tone="peach"
          label="Түгээмэл асуулт"
          onPress={() => router.push('/help')}
        />
        {SUPPORT_EMAIL ? (
          <SettingsRow icon="✉️" tone="mint" label="Холбоо барих" onPress={contactSupport} />
        ) : null}
      </SettingsGroup>

      <SettingsGroup title="Хууль эрх зүй">
        <SettingsRow
          icon="📄"
          tone="lavender"
          label="Үйлчилгээний нөхцөл"
          onPress={() => router.push('/legal/terms')}
        />
        <SettingsRow
          icon="🛡️"
          tone="mint"
          label="Нууцлалын бодлого"
          onPress={() => router.push('/legal/privacy')}
        />
      </SettingsGroup>

      <ThemedText type="caption" themeColor="textSecondary" style={styles.version}>
        Хэтэвч · Хувилбар {APP_VERSION}
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  version: {
    textAlign: 'center',
  },
});
