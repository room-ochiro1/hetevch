import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDeviceKey } from '@/lib/device-key';
import { supabase } from '@/lib/supabase';

/** Set once the welcome form is done, so an offline launch doesn't ask again. */
const ONBOARDED_KEY = 'hetevch.onboarded';

export type DeviceSession = {
  /** The welcome form (name + birth year) still has to be filled in. */
  needsOnboarding: boolean;
  /** An earlier install's data was found and moved to this session. */
  restored: boolean;
};

export async function markOnboardedLocally(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, '1');
}

/** After sign-out or account deletion the next account starts with the welcome form. */
export async function clearOnboardedLocally(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDED_KEY);
}

async function isOnboardedLocally(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
}

async function run(): Promise<DeviceSession> {
  const { data } = await supabase.auth.getSession();
  const hadSession = Boolean(data.session);

  if (!hadSession) {
    // No sign-in screen: every phone starts with an anonymous Supabase user.
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw new Error(`sign_in_failed: ${error.message}`);
    }
  }

  const device = await getDeviceKey();
  const { data: rows, error } = await supabase.rpc('claim_device', {
    device_key: device.key,
    device_platform: device.platform,
  });

  if (error) {
    // The owner's email account (used for the admin dashboard) is never device-linked.
    if (error.message === 'admin_account') {
      return { needsOnboarding: false, restored: false };
    }
    // Offline with a saved session: keep going with what this phone already knows.
    if (hadSession) {
      return { needsOnboarding: !(await isOnboardedLocally()), restored: false };
    }
    throw new Error(`claim_failed: ${error.message}`);
  }

  const row = rows?.[0];
  const needsOnboarding = row?.needs_onboarding ?? true;
  if (!needsOnboarding) {
    await markOnboardedLocally();
  }
  return { needsOnboarding, restored: row?.restored ?? false };
}

let pending: Promise<DeviceSession> | null = null;

/**
 * Makes sure this phone has a session tied to its device key, restoring the data of an
 * earlier install if there was one. Runs on every launch; concurrent calls share one run.
 */
export function ensureDeviceSession(): Promise<DeviceSession> {
  pending ??= run().finally(() => {
    pending = null;
  });
  return pending;
}
