import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'hetevch.theme';

type ThemePreferenceState = {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceState | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** Overrides the app's color scheme; `useColorScheme()` everywhere follows it. */
function applyPreference(preference: ThemePreference) {
  if (Platform.OS === 'web') return;
  Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isThemePreference(stored)) {
          setPreferenceState(stored);
          applyPreference(stored);
        }
      })
      // A missing or unreadable preference just means "follow the system".
      .catch(() => undefined);
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    applyPreference(next);
    // The choice already applies for this session; failing to persist only loses it on restart.
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }

  return (
    <ThemePreferenceContext value={{ preference, setPreference }}>
      {children}
    </ThemePreferenceContext>
  );
}

export function useThemePreference(): ThemePreferenceState {
  const value = use(ThemePreferenceContext);
  if (!value) {
    throw new Error('useThemePreference must be used inside <ThemePreferenceProvider>');
  }
  return value;
}
