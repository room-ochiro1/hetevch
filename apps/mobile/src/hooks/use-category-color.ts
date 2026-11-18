import { categoryColor, otherColor } from '@/constants/category-colors';

const CATEGORY_COLORS = { colorOf: categoryColor, other: otherColor() } as const;

/** Category display colors (the app is light only, so these never change). */
export function useCategoryColor() {
  return CATEGORY_COLORS;
}
