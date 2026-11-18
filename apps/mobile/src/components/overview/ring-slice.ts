import type { Overview } from '@/components/overview/use-overview';
import type { StatementTarget } from '@/components/statement/open-statement';

/** What the ring's center shows for a tapped segment. */
export type RingSlice = {
  icon: string;
  name: string;
  total: number;
  /** 0–1 of the ring. */
  share: number;
  /** The statement the center opens; null for the folded "other" slice. */
  target: StatementTarget | null;
};

/** The tapped segment's details, or null when the key is no longer on the ring. */
export function describeSlice(overview: Overview, key: string): RingSlice | null {
  const segment = overview.segments.find((item) => item.key === key);
  if (!segment) return null;
  const share = overview.total > 0 ? segment.value / overview.total : 0;

  if (key.startsWith('savings:')) {
    const card = overview.savings.find((item) => `savings:${item.cardId}` === key);
    if (!card) return null;
    const target = { type: 'savings', cardId: card.cardId } as const;
    return { icon: card.icon, name: card.name, total: segment.value, share, target };
  }
  if (key === 'other') {
    return { icon: '⋯', name: 'Бусад', total: segment.value, share, target: null };
  }
  const category = overview.shares.find((item) => item.category.id === key)?.category;
  if (!category) return null;
  return {
    icon: category.icon,
    name: category.name,
    total: segment.value,
    share,
    target: { type: 'category', id: category.id },
  };
}
