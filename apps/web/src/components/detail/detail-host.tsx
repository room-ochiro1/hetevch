import { Suspense } from 'react';

import { BandDetailView } from '@/components/detail/band-detail';
import { BandsDetailView } from '@/components/detail/bands-detail';
import { CategoryDetailView } from '@/components/detail/category-detail';
import { DayDetailView } from '@/components/detail/day-detail';
import { DetailDialog } from '@/components/detail/detail-dialog';
import { DetailSkeleton, type DetailCtx } from '@/components/detail/detail-parts';
import { KindDetailView } from '@/components/detail/kind-detail';
import { PurposeDetailView } from '@/components/detail/purpose-detail';
import { detailKey, filterHref, type Detail } from '@/lib/filters';

const LABELS: Record<Detail['type'], string> = {
  category: 'Ангиллын дэлгэрэнгүй',
  day: 'Өдрийн дэлгэрэнгүй',
  band: 'Насны бүлгийн дэлгэрэнгүй',
  bands: 'Насны бүлгүүд',
  kind: 'Орлого, зарлагын дэлгэрэнгүй',
  purpose: 'Хадгаламжийн зорилго',
};

function DetailContent({ detail, ctx }: { detail: Detail; ctx: DetailCtx }) {
  switch (detail.type) {
    case 'category':
      return <CategoryDetailView id={detail.id} band={detail.band} ctx={ctx} />;
    case 'day':
      return <DayDetailView day={detail.day} ctx={ctx} />;
    case 'band':
      return <BandDetailView band={detail.band} ctx={ctx} />;
    case 'bands':
      return <BandsDetailView ctx={ctx} />;
    case 'kind':
      return <KindDetailView kind={detail.kind} ctx={ctx} />;
    case 'purpose':
      return <PurposeDetailView icon={detail.icon} band={detail.band} ctx={ctx} />;
  }
}

/**
 * Renders the dialog named by `?detail=` (nothing when absent). The shell stays mounted while
 * links inside swap the content, which streams in under its own Suspense boundary.
 */
export function DetailHost({ detail, ctx }: { detail: Detail | null; ctx: DetailCtx }) {
  if (!detail) return null;
  return (
    <DetailDialog label={LABELS[detail.type]} closeHref={filterHref(ctx.basePath, ctx.filters)}>
      <Suspense key={detailKey(detail)} fallback={<DetailSkeleton />}>
        <DetailContent detail={detail} ctx={ctx} />
      </Suspense>
    </DetailDialog>
  );
}
