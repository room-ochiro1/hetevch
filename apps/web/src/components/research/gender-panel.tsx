import { GenderAgeTable } from '@/components/research/gender-age-table';
import { GenderCategoryBars } from '@/components/research/gender-category-bars';
import { GenderCompareTable } from '@/components/research/gender-compare-table';
import { Panel } from '@/components/ui/panel';
import { AGE_BAND_LABELS } from '@/lib/age-bands';
import { getGenderInsights } from '@/lib/dal/gender';
import type { Filters } from '@/lib/filters';

/**
 * Эр, эм: the two (or three, with those who did not say) side by side — how they earn, spend
 * and save, what they spend on, and how that moves with age. The age filter applies; the gender
 * filter does not, since comparing genders is the point here.
 */
export async function GenderPanel({ filters }: { filters: Filters }) {
  const { days, band } = filters;
  const { groups, categories, byAge } = await getGenderInsights(days, band);
  const scope = band ? AGE_BAND_LABELS[band] : 'бүх нас';

  return (
    <>
      <Panel
        title="Эр, эм: харьцуулалт"
        description={`Орлого, зарлага, хэмнэлт, хадгаламж хүйсээр · ${scope} · хүйсийн шүүлтүүр энд хамаарахгүй`}
      >
        <GenderCompareTable groups={groups} />
      </Panel>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel title="Юунд зарцуулдаг вэ" description={`Ангилал бүр эр, эмийн өөрийн зарлагын хэдэн хувь вэ · ${scope}`}>
          <GenderCategoryBars categories={categories} />
        </Panel>
        <Panel title="Нас ба хүйс" description="Насны бүлэг бүрийн эр, эм хэрэглэгч ба нэг хүний дундаж зарлага">
          <GenderAgeTable rows={byAge} />
        </Panel>
      </div>
    </>
  );
}
