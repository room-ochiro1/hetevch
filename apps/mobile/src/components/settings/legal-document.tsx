import { formatLongDate } from '@hetevch/shared';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { LegalDoc } from '@/content/types';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Renders terms or privacy text: date, intro, then numbered sections. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const theme = useTheme();

  return (
    <View style={styles.document}>
      <View style={[styles.updated, { backgroundColor: theme.surface }]}>
        <ThemedText type="caption" themeColor="textSecondary">
          Сүүлд шинэчилсэн: {formatLongDate(doc.updated)}
        </ThemedText>
      </View>
      <ThemedText style={styles.body}>{doc.intro}</ThemedText>

      {doc.sections.map((section, index) => (
        <View key={section.heading} style={styles.section}>
          <ThemedText type="smallBold" accessibilityRole="header" style={styles.heading}>
            {index + 1}. {section.heading}
          </ThemedText>
          {section.paragraphs?.map((paragraph) => (
            <ThemedText key={paragraph} themeColor="textSecondary" style={styles.body}>
              {paragraph}
            </ThemedText>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bullet}>
              <ThemedText themeColor="textSecondary" style={styles.body}>
                •
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={[styles.body, styles.bulletText]}>
                {bullet}
              </ThemedText>
            </View>
          ))}
          {section.note ? (
            <ThemedText themeColor="textSecondary" style={styles.body}>
              {section.note}
            </ThemedText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  document: {
    gap: Spacing.four,
  },
  updated: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  section: {
    gap: Spacing.two,
  },
  heading: {
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: 400,
  },
  bullet: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingLeft: Spacing.one,
  },
  bulletText: {
    flex: 1,
  },
});
