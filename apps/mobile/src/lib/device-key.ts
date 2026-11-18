import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type DevicePlatform = 'android' | 'ios' | 'web';
export type DeviceKey = { key: string; platform: DevicePlatform };

const STORE_KEY = 'hetevch.device-key';
// Kept on this phone only: not synced to iCloud or moved to a new phone by a backup.
const KEYCHAIN = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

function randomKey(): string {
  return Array.from(Crypto.getRandomBytes(32), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function storedKey(get: () => Promise<string | null>, set: (value: string) => Promise<void>) {
  const existing = await get();
  if (existing) {
    return existing;
  }
  const created = randomKey();
  await set(created);
  return created;
}

/**
 * A key for this app on this phone that survives uninstall and reinstall (IMEI is not
 * readable by apps on Android 10+ or iOS):
 * - Android: ANDROID_ID, unique per app-signing key, user and device; a factory reset changes it.
 * - iOS: a random secret in the Keychain, which iOS keeps after the app is deleted.
 * - Otherwise (web, or Android without an ID): a random value in local storage.
 * The server only ever stores a hash of it.
 */
export async function getDeviceKey(): Promise<DeviceKey> {
  if (Platform.OS === 'android') {
    const androidId = Application.getAndroidId();
    if (androidId) {
      return { key: `android:${androidId}`, platform: 'android' };
    }
  }
  if (Platform.OS === 'ios') {
    const secret = await storedKey(
      () => SecureStore.getItemAsync(STORE_KEY, KEYCHAIN),
      (value) => SecureStore.setItemAsync(STORE_KEY, value, KEYCHAIN),
    );
    return { key: `ios:${secret}`, platform: 'ios' };
  }
  const local = await storedKey(
    () => AsyncStorage.getItem(STORE_KEY),
    (value) => AsyncStorage.setItem(STORE_KEY, value),
  );
  return { key: `local:${local}`, platform: Platform.OS === 'android' ? 'android' : 'web' };
}
