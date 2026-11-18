import { router } from 'expo-router';

import { FaqItem } from '@/components/settings/faq-item';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Page } from '@/components/ui/page';
import { SUPPORT_EMAIL, contactSupport } from '@/constants/app-info';
import { FAQ } from '@/content/faq';

export default function HelpScreen() {
  return (
    <Page>
      <ThemedText type="small" themeColor="textSecondary">
        Асуулт дээр дарж хариуг нь харна уу.
      </ThemedText>

      <SettingsGroup>
        {FAQ.map((entry) => (
          <FaqItem key={entry.question} entry={entry} />
        ))}
      </SettingsGroup>

      <SettingsGroup title="Хариугаа олсонгүй юу?">
        {SUPPORT_EMAIL ? (
          <SettingsRow
            icon="✉️"
            tone="mint"
            label="Бидэнд бичих"
            value={SUPPORT_EMAIL}
            onPress={contactSupport}
          />
        ) : null}
        <SettingsRow
          icon="🛡️"
          tone="lavender"
          label="Нууцлалын бодлого"
          onPress={() => router.push('/legal/privacy')}
        />
      </SettingsGroup>
    </Page>
  );
}
