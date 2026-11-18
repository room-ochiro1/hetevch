import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { StartupError } from '@/components/onboarding/startup-error';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { CurrencyProvider } from '@/providers/currency';
import { FinanceDataProvider } from '@/providers/finance-data';

SplashScreen.preventAutoHideAsync();

/** React Navigation theme built from our palette so headers and modals match the app. */
const NAVIGATION_THEME: typeof DefaultTheme = (() => {
  const palette = Colors.light;
  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
    },
  };
})();

function RootNavigator() {
  const { session, isLoading, needsOnboarding, error, retry } = useAuth();
  const theme = useTheme();

  /** Screens pushed over the tabs: a flat native header on the page color, back arrow only. */
  const pushed = (title: string) =>
    ({
      title,
      headerShown: true,
      headerBackButtonDisplayMode: 'minimal',
      headerShadowVisible: false,
      headerStyle: { backgroundColor: theme.background },
      headerTintColor: theme.text,
      contentStyle: { backgroundColor: theme.background },
    }) as const;

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }
  // No sign-in screen: the phone gets its own account on launch (see AuthProvider).
  if (!session) {
    return <StartupError message={error ?? ''} onRetry={retry} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* redirectTo is explicit: without it a blocked route falls back to the first open
          screen (help), not to the welcome form. */}
      <Stack.Protected guard={!needsOnboarding} redirectTo="/welcome">
        <Stack.Screen name="(app)" />
        <Stack.Screen name="transaction" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/account" options={pushed('Хувийн мэдээлэл')} />
        <Stack.Screen name="settings/categories" options={pushed('Ангилал')} />
        <Stack.Screen name="statement" options={pushed('Хуулга')} />
        <Stack.Screen name="settings/category" options={{ presentation: 'modal' }} />
        <Stack.Screen name="savings/calculator" options={pushed('Хүүгийн тооцоолуур')} />
        <Stack.Screen name="savings/[id]" options={pushed('Хадгаламж')} />
        <Stack.Screen name="savings/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="savings/entry" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={needsOnboarding} redirectTo="/">
        <Stack.Screen name="welcome" />
      </Stack.Protected>
      {/* Open to everyone: the welcome screen links to the terms and the privacy policy. */}
      <Stack.Screen name="help" options={pushed('Түгээмэл асуулт')} />
      {/* Developer-only preview of the first-launch form (redirects home in release builds). */}
      <Stack.Screen name="welcome-preview" />
      <Stack.Screen name="legal/terms" options={pushed('Үйлчилгээний нөхцөл')} />
      <Stack.Screen name="legal/privacy" options={pushed('Нууцлалын бодлого')} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={NAVIGATION_THEME}>
      <AuthProvider>
        <CurrencyProvider>
          <FinanceDataProvider>
            <RootNavigator />
          </FinanceDataProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
