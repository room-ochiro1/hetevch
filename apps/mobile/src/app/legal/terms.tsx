import { LegalDocument } from '@/components/settings/legal-document';
import { Page } from '@/components/ui/page';
import { TERMS } from '@/content/terms';

/** Public: also opened from the sign-in screen before an account exists. */
export default function TermsScreen() {
  return (
    <Page>
      <LegalDocument doc={TERMS} />
    </Page>
  );
}
