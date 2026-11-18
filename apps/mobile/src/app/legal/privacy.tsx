import { LegalDocument } from '@/components/settings/legal-document';
import { Page } from '@/components/ui/page';
import { PRIVACY } from '@/content/privacy';

/** Public: also opened from the welcome screen before onboarding is done. */
export default function PrivacyScreen() {
  return (
    <Page>
      <LegalDocument doc={PRIVACY} />
    </Page>
  );
}
