import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { FinanceDataProvider } from '@/providers/finance-data';
import { ThemePreferenceProvider } from '@/providers/theme-preference';

SplashScreen.preventAutoHideAsync();

/** React Navigation theme built from our palette so headers and modals match the app. */
function navigationTheme(scheme: 'light' | 'dark'): typeof DefaultTheme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const palette = Colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
    },
  };
}

function RootNavigator() {
  const { session, isLoading } = useAuth();
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="transaction" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings/account" options={pushed('Хувийн мэдээлэл')} />
        <Stack.Screen name="settings/password" options={pushed('Нууц үг солих')} />
        <Stack.Screen name="savings/accounts" options={pushed('Хадгаламж')} />
        <Stack.Screen name="savings/calculator" options={pushed('Хүүгийн тооцоолуур')} />
        <Stack.Screen name="savings/edit" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      {/* Open to everyone: the sign-in screen links to the terms and the privacy policy. */}
      <Stack.Screen name="help" options={pushed('Түгээмэл асуулт')} />
      <Stack.Screen name="legal/terms" options={pushed('Үйлчилгээний нөхцөл')} />
      <Stack.Screen name="legal/privacy" options={pushed('Нууцлалын бодлого')} />
    </Stack>
  );
}

function ThemedRoot() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ThemeProvider value={navigationTheme(scheme)}>
      <AuthProvider>
        <FinanceDataProvider>
          <RootNavigator />
        </FinanceDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <ThemedRoot />
    </ThemePreferenceProvider>
  );
}
