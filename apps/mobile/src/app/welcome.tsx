import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WelcomeForm } from '@/components/onboarding/welcome-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Logo } from '@/components/ui/logo';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * First launch on a phone: a short dialog for name, birth year and agreeing to the terms; no
 * account to create.
 */
export default function WelcomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <View
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Logo size={64} />
              <View style={styles.titles}>
                <ThemedText type="heading">Тавтай морил!</ThemedText>
                <ThemedText themeColor="textSecondary">
                  Бүртгүүлэх, нэвтрэх шаардлагагүй. Нэр, төрсөн оноо оруулж, нөхцөлийг зөвшөөрөөд шууд эхэлнэ үү.
                </ThemedText>
              </View>
              <WelcomeForm />
              <ThemedText type="small" themeColor="textSecondary">
                Таны мэдээлэл энэ утсанд холбогдож хадгалагдана. Аппаа устгаад дахин суулгасан ч
                буцаж ирнэ.
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radius.large,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  titles: {
    gap: Spacing.one,
  },
});
