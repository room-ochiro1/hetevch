import {
  MAX_AGE,
  MIN_AGE,
  ageFromBirthYear,
  formatLongDate,
  parseBirthYear,
  parseGender,
  toISODate,
  type Gender,
  type Profile,
} from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { GenderField } from '@/components/settings/gender-field';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { deleteAccount, updateProfile } from '@/lib/account';
import { useFinanceData } from '@/providers/finance-data';

/** Edit the name, birth year and gender, see when the account began, delete the account. */
export function AccountForm({ profile }: { profile: Profile }) {
  const { invalidate } = useFinanceData();
  const savedName = profile.full_name?.trim() ?? '';
  const savedYear = profile.birth_year ? String(profile.birth_year) : '';
  const [name, setName] = useState(savedName);
  const [yearText, setYearText] = useState(savedYear);
  const savedGender = parseGender(profile.gender);
  const [gender, setGender] = useState<Gender | null>(savedGender);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const changed =
    name.trim() !== savedName || yearText.trim() !== savedYear || gender !== savedGender;
  const birthYear = parseBirthYear(yearText);

  async function save() {
    if (yearText.trim() && birthYear === null) {
      setError(`Төрсөн оноо 4 оронтойгоор бичнэ үү (${MIN_AGE}–${MAX_AGE} нас). Жишээ нь: 1998`);
      return;
    }
    setBusy('saving');
    setError(null);
    const saveError = await updateProfile(profile.id, { fullName: name, birthYear, gender });
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
      'Таны бүх гүйлгээ, хадгаламж бүрмөсөн устах бөгөөд сэргээх боломжгүй. Апп шинээр эхэлнэ.',
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Устгах',
          style: 'destructive',
          onPress: async () => {
            setBusy('deleting');
            setError(null);
            // On success the session ends and the app shows the welcome form again.
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
        />
        <TextField
          label="Төрсөн он"
          value={yearText}
          onChangeText={(text) => setYearText(text.replace(/\D/g, '').slice(0, 4))}
          placeholder="Жишээ нь: 1998"
          keyboardType="number-pad"
          maxLength={4}
        />
        {birthYear !== null ? (
          <ThemedText type="small" themeColor="textSecondary">
            Энэ жил {ageFromBirthYear(birthYear)} нас хүрнэ.
          </ThemedText>
        ) : null}
        <GenderField value={gender} onChange={setGender} />
        <Button
          title="Хадгалах"
          onPress={save}
          loading={busy === 'saving'}
          disabled={!changed || busy !== null}
        />
      </View>

      <SettingsGroup title="Бүртгэлийн мэдээлэл">
        <SettingsRow
          icon="📅"
          tone="peach"
          label="Эхэлсэн"
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
          Бүртгэлээ устгавал энэ утсан дээрх таны бүх гүйлгээ, хадгаламж бүрмөсөн устна. Утсаа
          бусдад өгөх, зарахаасаа өмнө заавал устгаарай.
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
