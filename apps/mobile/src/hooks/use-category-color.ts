import { useMemo } from 'react';

import { categoryColor, otherColor } from '@/constants/category-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Resolves category display colors for the active theme (stable until the theme changes). */
export function useCategoryColor() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(
    () => ({
      colorOf: (storedColor: string | null | undefined) => categoryColor(storedColor, scheme),
      other: otherColor(scheme),
      scheme,
    }),
    [scheme],
  );
}
