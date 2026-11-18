import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CategoryStatement } from '@/components/statement/category-statement';
import { parseStatementParams } from '@/components/statement/open-statement';
import { PeriodSwitcher } from '@/components/statement/period-switcher';
import { SavingsStatement } from '@/components/statement/savings-statement';
import { Page } from '@/components/ui/page';
import { StateMessage } from '@/components/ui/state-message';
import { useCategories } from '@/hooks/use-finance';
import { useSavingsCard } from '@/hooks/use-savings';

/**
 * Bank-statement view opened from the overview's category list. `?category=<id>` or
 * `?savings=1`, plus the overview's `kind`, `period` and `anchor` to start from.
 */
export default function StatementScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    savings?: string;
    kind?: string;
    period?: string;
    anchor?: string;
  }>();
  const { target, window: initial } = parseStatementParams(params);
  const [shown, setShown] = useState(initial);
  const categories = useCategories();
  const card = useSavingsCard(target?.type === 'savings' ? target.cardId : undefined).data;
  const title =
    target?.type === 'savings'
      ? (card?.name ?? 'Хадгаламж')
      : (categories.data?.find((item) => item.id === target?.id)?.name ?? 'Хуулга');

  return (
    <Page>
      <Stack.Screen options={{ title }} />
      <PeriodSwitcher
        period={shown.period}
        anchor={shown.anchor}
        onChange={(period, anchor) => setShown({ ...shown, period, anchor })}
      />
      {target === null ? (
        <StateMessage icon="🔍" title="Хуулга олдсонгүй" />
      ) : target.type === 'category' ? (
        <CategoryStatement categoryId={target.id} window={shown} />
      ) : (
        <SavingsStatement window={shown} cardId={target.cardId} />
      )}
    </Page>
  );
}
