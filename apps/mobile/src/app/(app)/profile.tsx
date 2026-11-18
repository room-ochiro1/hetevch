import { router } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';

import { IdentityCard } from '@/components/settings/identity-card';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Segmented, type SegmentOption } from '@/components/ui/segmented';
import { StateMessage } from '@/components/ui/state-message';
import { APP_VERSION, SUPPORT_EMAIL, contactSupport } from '@/constants/app-info';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import { useThemePreference, type ThemePreference } from '@/providers/theme-preference';

const THEME_OPTIONS: readonly SegmentOption<ThemePreference>[] = [
  { value: 'system', label: 'Систем' },
  { value: 'light', label: 'Цайвар' },
  { value: 'dark', label: 'Бараан' },
];

function confirmSignOut() {
  Alert.alert('Гарах уу?', 'Дараа нь имэйл, нууц үгээрээ дахин нэвтэрнэ.', [
    { text: 'Болих', style: 'cancel' },
    { text: 'Гарах', style: 'destructive', onPress: () => supabase.auth.signOut() },
  ]);
}

/** Account, preferences, help and legal, grouped the way phone settings are. */
export default function ProfileScreen() {
  const { data: profile, error } = useProfile();
  const { preference, setPreference } = useThemePreference();

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
        <SettingsRow
          icon="🔒"
          tone="mint"
          label="Нууц үг солих"
          onPress={() => router.push('/settings/password')}
        />
      </SettingsGroup>

      <SettingsGroup title="Тохиргоо" footer="«Систем» сонговол утасныхаа тохиргоог дагана.">
        <SettingsRow icon="🌗" tone="accent" label="Харагдах байдал">
          <Segmented
            options={THEME_OPTIONS}
            value={preference}
            onChange={setPreference}
            accessibilityLabel="Өнгөний горим"
          />
        </SettingsRow>
        <SettingsRow icon="💵" tone="peach" label="Мөнгөн тэмдэгт" value="₮ Төгрөг" />
      </SettingsGroup>

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

      <SettingsGroup>
        <SettingsRow icon="🚪" tone="danger" label="Гарах" onPress={confirmSignOut} />
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
