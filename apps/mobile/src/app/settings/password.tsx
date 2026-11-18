import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
import { TextField } from '@/components/ui/text-field';
import { MIN_PASSWORD_LENGTH, changePassword } from '@/lib/account';

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Нууц үг дор хаяж ${MIN_PASSWORD_LENGTH} тэмдэгт байх ёстой.`);
      return;
    }
    if (password !== repeat) {
      setError('Хоёр нууц үг таарахгүй байна.');
      return;
    }
    setSaving(true);
    setError(null);
    const saveError = await changePassword(password);
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    Alert.alert('Нууц үг солигдлоо', 'Дараагийн удаа шинэ нууц үгээрээ нэвтэрнэ.', [
      { text: 'За', onPress: () => router.back() },
    ]);
  }

  return (
    <Page>
      <ThemedText type="small" themeColor="textSecondary">
        Бусдад таагдахааргүй, дор хаяж {MIN_PASSWORD_LENGTH} тэмдэгттэй нууц үг сонгоорой.
        Үсэг, тоо хольсон байвал илүү найдвартай.
      </ThemedText>
      <TextField
        label="Шинэ нууц үг"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        autoFocus
      />
      <TextField
        label="Шинэ нууц үгээ дахин оруулна уу"
        value={repeat}
        onChangeText={setRepeat}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      <Button title="Нууц үг солих" onPress={submit} loading={saving} />
    </Page>
  );
}
