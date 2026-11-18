import { LegalDocument } from '@/components/settings/legal-document';
import { Page } from '@/components/ui/page';
import { PRIVACY } from '@/content/privacy';

/** Public: also opened from the sign-in screen before an account exists. */
export default function PrivacyScreen() {
  return (
    <Page>
      <LegalDocument doc={PRIVACY} />
    </Page>
  );
}
