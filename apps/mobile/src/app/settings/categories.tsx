import type { TransactionKind } from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { CategoryRow } from '@/components/categories/category-row';
import { KIND_OPTIONS } from '@/components/finance/kind-options';
import { SettingsGroup } from '@/components/settings/settings-group';
import { SettingsRow } from '@/components/settings/settings-row';
import { Page } from '@/components/ui/page';
import { Segmented } from '@/components/ui/segmented';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme';

/**
 * The user's own categories (tap to edit, or add one) above the built-in ones, which are
 * read-only. One kind at a time, like the transaction sheet.
 */
export default function CategoriesScreen() {
  const theme = useTheme();
  const [kind, setKind] = useState<TransactionKind>('expense');
  const { data, error } = useCategories();
  const ofKind = (data ?? []).filter((category) => category.kind === kind);
  const own = ofKind.filter((category) => category.owner_id !== null);
  const builtIn = ofKind.filter((category) => category.owner_id === null);
  const ownCount = (data ?? []).filter((category) => category.owner_id !== null).length;

  return (
    <Page>
      <Segmented
        options={KIND_OPTIONS}
        value={kind}
        onChange={setKind}
        accessibilityLabel="Ангиллын төрөл"
      />

      {error ? (
        <StateMessage tone="error" icon="⚠️" title="Ангиллыг ачаалж чадсангүй" body={error} />
      ) : !data ? (
        <ActivityIndicator color={theme.accent} style={styles.spinner} />
      ) : (
        <>
          <SettingsGroup
            title="Миний ангилал"
            footer="Өөрийн ангиллаа дарж нэр, emoji, өнгийг нь өөрчилнө.">
            {own.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onPress={() =>
                  router.push({ pathname: '/settings/category', params: { id: category.id } })
                }
              />
            ))}
            <SettingsRow
              icon="➕"
              tone="accent"
              label="Ангилал нэмэх"
              onPress={() =>
                router.push({
                  pathname: '/settings/category',
                  params: { kind, ownCount: String(ownCount) },
                })
              }
            />
          </SettingsGroup>

          <SettingsGroup title="Үндсэн ангилал" footer="Үндсэн ангиллыг өөрчлөх боломжгүй.">
            {builtIn.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </SettingsGroup>
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  spinner: { paddingVertical: Spacing.six },
});
