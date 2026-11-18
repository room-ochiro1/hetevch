import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing, type CardTone } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  /** Soft grey by default; a pastel tint for highlight cards. */
  tone?: 'surface' | CardTone;
};

/** A soft, borderless rounded block that groups content on the white canvas. */
export function Card({ style, tone = 'surface', ...rest }: CardProps) {
  const theme = useTheme();

  return <View style={[styles.card, { backgroundColor: theme[tone] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large + 2,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
