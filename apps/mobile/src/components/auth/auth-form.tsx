import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type Mode = 'sign-in' | 'sign-up';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === 'sign-up';

  async function submit() {
    if (!email.trim() || !password) {
      setError('Имэйл болон нууц үгээ оруулна уу.');
      return;
    }
    setLoading(true);
    setError(null);
    const credentials = { email: email.trim(), password };
    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({
          ...credentials,
          options: { data: { full_name: fullName.trim() || null } },
        })
      : await supabase.auth.signInWithPassword(credentials);
    setLoading(false);
    // On success the auth listener updates the session and the router moves on.
    if (authError) {
      setError(authError.message);
    }
  }

  return (
    <View style={styles.form}>
      {isSignUp ? (
        <TextField label="Нэр" value={fullName} onChangeText={setFullName} autoComplete="name" />
      ) : null}
      <TextField
        label="Имэйл"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextField
        label="Нууц үг"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
      />
      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      <Button title={isSignUp ? 'Бүртгүүлэх' : 'Нэвтрэх'} onPress={submit} loading={loading} />
      <Button
        variant="secondary"
        title={isSignUp ? 'Бүртгэлтэй юу? Нэвтрэх' : 'Шинэ хэрэглэгч? Бүртгүүлэх'}
        onPress={() => {
          setError(null);
          setMode(isSignUp ? 'sign-in' : 'sign-up');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
