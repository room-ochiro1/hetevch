import { formatLongDate, toISODate, type Profile } from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { deleteAccount, updateFullName } from '@/lib/account';
import { useFinanceData } from '@/providers/finance-data';

/** Edit the display name, see the account facts, and delete the account. */
export function AccountForm({ profile }: { profile: Profile }) {
  const { invalidate } = useFinanceData();
  const saved = profile.full_name?.trim() ?? '';
  const [name, setName] = useState(saved);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const changed = name.trim() !== saved;

  async function save() {
    setBusy('saving');
    setError(null);
    const saveError = await updateFullName(profile.id, name);
    setBusy(null);
    if (saveError) {
      setError(saveError);
      return;
    }
    invalidate();
    router.back();
  }

  function confirmDelete() {
    Alert.alert(
      'Бүртгэлээ устгах уу?',
      'Таны бүх гүйлгээ, мэдээлэл бүрмөсөн устах бөгөөд сэргээх боломжгүй.',
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Устгах',
          style: 'destructive',
          onPress: async () => {
            setBusy('deleting');
            setError(null);
            // On success the session ends and the router switches to the sign-in screen.
            const deleteError = await deleteAccount();
            setBusy(null);
            if (deleteError) setError(deleteError);
          },
        },
      ],
    );
  }

  return (
    <>
      <View style={styles.block}>
        <TextField
          label="Нэр"
          value={name}
          onChangeText={setName}
          placeholder="Таны нэр"
          autoComplete="name"
          textContentType="name"
          maxLength={80}
          returnKeyType="done"
          onSubmitEditing={changed ? save : undefined}
        />
        <Button
          title="Хадгалах"
          onPress={save}
          loading={busy === 'saving'}
          disabled={!changed || busy !== null}
        />
      </View>

      <SettingsGroup title="Бүртгэлийн мэдээлэл">
        <SettingsRow icon="✉️" tone="mint" label="Имэйл" value={profile.email ?? '—'} />
        <SettingsRow
          icon="📅"
          tone="peach"
          label="Бүртгүүлсэн"
          value={formatLongDate(toISODate(new Date(profile.created_at)))}
        />
      </SettingsGroup>

      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.block}>
        <ThemedText type="smallBold">Бүртгэл устгах</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Бүртгэлээ устгавал таны бүх гүйлгээ, тохиргоо бүрмөсөн устна. Энэ үйлдлийг буцаах
          боломжгүй.
        </ThemedText>
        <Button
          variant="danger"
          title="Бүртгэлээ устгах"
          onPress={confirmDelete}
          loading={busy === 'deleting'}
          disabled={busy !== null}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.three,
  },
});
