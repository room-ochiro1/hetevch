import { MAX_AGE, MIN_AGE, ageFromBirthYear, parseBirthYear, type Gender } from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { GenderField } from '@/components/settings/gender-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { PRIVACY } from '@/content/privacy';
import { TERMS } from '@/content/terms';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useFinanceData } from '@/providers/finance-data';

const MAX_NAME_LENGTH = 40;

/**
 * Name, birth year and gender, the only things the app asks for, and an explicit tick for the terms and
 * privacy policy: «Эхлэх» stays off until it is ticked, and the acceptance is recorded.
 */
export function WelcomeForm({ preview = false }: { preview?: boolean }) {
  const theme = useTheme();
  const { session, finishOnboarding } = useAuth();
  const { invalidate } = useFinanceData();
  const [name, setName] = useState('');
  const [birthYearText, setBirthYearText] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const birthYear = parseBirthYear(birthYearText);
  const ageHint = birthYear === null ? null : `${ageFromBirthYear(birthYear)} настай`;

  async function submit() {
    const fullName = name.trim();
    if (!fullName) {
      setError('Нэрээ оруулна уу.');
      return;
    }
    if (birthYear === null) {
      setError(`Төрсөн оноо 4 оронтойгоор оруулна уу (${MIN_AGE}–${MAX_AGE} настай).`);
      return;
    }
    if (gender === null) {
      setError('Хүйсээ сонгоно уу.');
      return;
    }
    if (!agreed || !session) {
      return;
    }
    if (preview) {
      setError('Урьдчилан харах горим: бүх талбар зөв байна, юу ч хадгалсангүй.');
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, birth_year: birthYear, gender })
      .eq('id', session.user.id);
    // Which versions were accepted, so a later change to either document can ask again.
    const { error: consentError } = saveError
      ? { error: null }
      : await supabase
          .from('legal_consents')
          .insert({ terms_version: TERMS.updated, privacy_version: PRIVACY.updated });
    if (saveError || consentError) {
      setSaving(false);
      setError('Хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.');
      return;
    }
    await invalidate();
    await finishOnboarding();
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Таны нэр"
        value={name}
        onChangeText={setName}
        placeholder="Жишээ нь: Болд"
        autoComplete="name"
        autoCapitalize="words"
        maxLength={MAX_NAME_LENGTH}
        returnKeyType="next"
      />
      <View style={styles.yearField}>
        <TextField
          label="Төрсөн он"
          value={birthYearText}
          onChangeText={(text) => setBirthYearText(text.replace(/\D/g, ''))}
          placeholder="Жишээ нь: 1998"
          keyboardType="number-pad"
          maxLength={4}
          onSubmitEditing={submit}
        />
        {ageHint ? (
          <ThemedText type="small" themeColor="textSecondary">
            {ageHint}
          </ThemedText>
        ) : null}
      </View>
      <GenderField value={gender} onChange={setGender} />
      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      <Checkbox
        checked={agreed}
        onChange={setAgreed}
        accessibilityLabel="Үйлчилгээний нөхцөл болон Нууцлалын бодлогыг уншиж, зөвшөөрч байна">
        <ThemedText type="small">
          Би{' '}
          <Text style={[styles.link, { color: theme.accentText }]} onPress={() => router.push('/legal/terms')}>
            Үйлчилгээний нөхцөл
          </Text>{' '}
          болон{' '}
          <Text style={[styles.link, { color: theme.accentText }]} onPress={() => router.push('/legal/privacy')}>
            Нууцлалын бодлого
          </Text>
          -ыг уншиж, зөвшөөрч байна.
        </ThemedText>
      </Checkbox>
      <Button title="Эхлэх" onPress={submit} loading={saving} disabled={!agreed} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  yearField: {
    gap: Spacing.one,
  },
  link: {
    fontWeight: 700,
    textDecorationLine: 'underline',
  },
});
