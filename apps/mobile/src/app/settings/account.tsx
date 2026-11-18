import { ActivityIndicator } from 'react-native';

import { AccountForm } from '@/components/settings/account-form';
import { Page } from '@/components/ui/page';
import { StateMessage } from '@/components/ui/state-message';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';

export default function AccountScreen() {
  const theme = useTheme();
  const { data: profile, error } = useProfile();

  return (
    <Page>
      {profile ? (
        <AccountForm key={profile.id} profile={profile} />
      ) : error ? (
        <StateMessage
          tone="error"
          icon="⚠️"
          title="Мэдээлэл ачаалж чадсангүй"
          body="Интернэт холболтоо шалгаад дахин оролдоно уу."
        />
      ) : (
        <ActivityIndicator color={theme.accent} />
      )}
    </Page>
  );
}
