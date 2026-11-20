import { deleteCategory } from '@/app/(admin)/categories/actions';
import { ConfirmFlow } from '@/components/ui/confirm-flow';
import { ReviewRow } from '@/components/ui/confirm-parts';
import { TrashIcon } from '@/components/ui/icons-more';

type DeleteCategoryButtonProps = {
  id: string;
  name: string;
  icon: string;
  inUse: boolean;
};

/**
 * Deletes a built-in category nobody has used yet, after a review → confirm dialog. One with
 * transactions can't be deleted (the database refuses it too), so users never lose entries.
 */
export function DeleteCategoryButton({ id, name, icon, inUse }: DeleteCategoryButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <ConfirmFlow
        trigger={{
          label: 'Устгах',
          variant: 'danger',
          disabled: inUse,
          title: inUse ? 'Гүйлгээнд ашиглагдаж буй ангиллыг устгах боломжгүй' : undefined,
          icon: <TrashIcon className="size-4" />,
        }}
        tone="expense"
        icon={<TrashIcon className="size-5" />}
        title={`«${name}» ангиллыг устгах`}
        subtitle="Бүх хэрэглэгчийн аппаас энэ ангилал алга болно"
        review={
          <>
            <ReviewRow label="Ангилал">
              {icon} {name}
            </ReviewRow>
            <ReviewRow label="Ашигласан гүйлгээ">0</ReviewRow>
            <ReviewRow label="Хэрэглэгчийн өгөгдөл">Өөрчлөгдөхгүй</ReviewRow>
          </>
        }
        summary={
          <div className="flex items-center gap-4">
            <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-surface text-3xl shadow-card">
              {icon}
            </span>
            <div>
              <p className="text-xs text-muted">Устгагдах ангилал</p>
              <p className="text-2xl font-semibold tracking-tight">{name}</p>
            </div>
          </div>
        }
        checks={['Энэ үйлдлийг буцаах боломжгүйг ойлгож байна']}
        notice="Дахин хэрэгтэй бол «Шинэ ангилал» хэсгээс шинээр нэмж болно."
        confirmLabel="Устгах"
        action={deleteCategory}
        fields={{ id }}
      />
      {inUse ? <p className="text-xs text-muted">Гүйлгээнд ашиглагдаж байгаа тул устгах боломжгүй.</p> : null}
    </div>
  );
}
