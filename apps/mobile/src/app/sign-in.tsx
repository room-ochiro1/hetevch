import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SignInScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}>
          <View style={[styles.logo, { backgroundColor: theme.accent }]}>
            <Text style={styles.logoGlyph}>👛</Text>
          </View>
          <View style={styles.titles}>
            <ThemedText type="subtitle">Хэтэвч</ThemedText>
            <ThemedText themeColor="textSecondary">
              Орлого, зарлагаа нэг дороос хянаарай.
            </ThemedText>
          </View>
          <AuthForm />
          <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
            Үргэлжлүүлснээр та{' '}
            <Text
              accessibilityRole="link"
              style={[styles.link, { color: theme.accentText }]}
              onPress={() => router.push('/legal/terms')}>
              Үйлчилгээний нөхцөл
            </Text>{' '}
            болон{' '}
            <Text
              accessibilityRole="link"
              style={[styles.link, { color: theme.accentText }]}
              onPress={() => router.push('/legal/privacy')}>
              Нууцлалын бодлого
            </Text>
            ыг зөвшөөрч байна.
          </ThemedText>
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
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontSize: 32,
    lineHeight: 40,
  },
  titles: {
    gap: Spacing.one,
  },
  legal: {
    textAlign: 'center',
  },
  link: {
    fontWeight: 700,
  },
});
