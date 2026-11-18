import { categoryDraftError, type Category, type TransactionKind } from '@hetevch/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

import { USER_CATEGORY_COLORS } from '@/constants/category-colors';
import { useUserId } from '@/hooks/use-finance';
import { deleteCategory, saveCategory } from '@/lib/categories';
import { useFinanceData } from '@/providers/finance-data';

export type CategoryFormOptions = {
  /** The user's own category being edited; omit to add a new one. */
  initial?: Category;
  /** Kind for a new category (the tab the user came from). */
  kind?: TransactionKind;
  /** How many categories the user already has, so each new one starts on the next color. */
  ownCount?: number;
};

/** State and actions for the add/edit category sheet. */
export function useCategoryForm({ initial, kind: presetKind, ownCount = 0 }: CategoryFormOptions) {
  const userId = useUserId();
  const { invalidate } = useFinanceData();
  const [kind, setKind] = useState<TransactionKind>(initial?.kind ?? presetKind ?? 'expense');
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [color, setColor] = useState(
    initial?.color ?? USER_CATEGORY_COLORS[ownCount % USER_CATEGORY_COLORS.length] ?? '#2A78D6',
  );
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);
  const [error, setError] = useState<string | null>(null);

  function finish() {
    invalidate();
    router.back();
  }

  async function submit() {
    Keyboard.dismiss();
    const problem = categoryDraftError(name, icon);
    if (problem) {
      setError(problem);
      return;
    }
    if (!userId) {
      setError('Аппаа хаагаад дахин нээнэ үү.');
      return;
    }
    setError(null);
    setBusy('saving');
    const saveError = await saveCategory({ kind, name, icon, color }, userId, initial?.id);
    setBusy(null);
    if (saveError) setError(saveError);
    else finish();
  }

  function confirmDelete() {
    const id = initial?.id;
    if (!id || !userId) return;
    Alert.alert(`«${initial.name}» ангиллыг устгах уу?`, 'Устгасан ангиллыг сэргээх боломжгүй.', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: async () => {
          setBusy('deleting');
          const deleteError = await deleteCategory(id, userId);
          setBusy(null);
          if (deleteError) setError(deleteError);
          else finish();
        },
      },
    ]);
  }

  return {
    isEditing: Boolean(initial),
    kind,
    setKind,
    name,
    setName,
    icon,
    setIcon,
    color,
    setColor,
    busy,
    error,
    submit,
    confirmDelete,
  };
}
