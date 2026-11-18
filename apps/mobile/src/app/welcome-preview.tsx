import { Redirect } from 'expo-router';

import { WelcomeView } from '@/components/onboarding/welcome-view';

/**
 * Developer-only look at the first-launch form for accounts that are already set up. It
 * checks the fields but saves nothing; release builds send it straight to the home screen.
 */
export default function WelcomePreviewScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <WelcomeView preview />;
}
