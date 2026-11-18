import Constants from 'expo-constants';
import { Alert, Linking } from 'react-native';

/** "1.0.0" from app.json; shown under the profile and in support emails. */
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

/**
 * Where users write for help. Set EXPO_PUBLIC_SUPPORT_EMAIL in apps/mobile/.env (and in the
 * EAS environment for builds); without it the "Холбоо барих" entries stay hidden.
 */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || null;

/** Opens the mail app with a pre-filled subject; falls back to showing the address. */
export function contactSupport() {
  if (!SUPPORT_EMAIL) return;
  const subject = encodeURIComponent(`Хэтэвч апп (${APP_VERSION})`);
  Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`).catch(() => {
    Alert.alert('Имэйл апп олдсонгүй', `Бидэнд ${SUPPORT_EMAIL} хаягаар бичээрэй.`);
  });
}
