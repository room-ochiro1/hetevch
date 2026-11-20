import { changeRole } from '@/app/(admin)/users/[id]/actions';
import { Badge } from '@/components/ui/badge';
import { ConfirmFlow } from '@/components/ui/confirm-flow';
import { ReviewRow } from '@/components/ui/confirm-parts';
import { ShieldIcon } from '@/components/ui/icons-more';

type RoleFormProps = {
  userId: string;
  name: string;
  role: 'user' | 'admin';
  isSelf: boolean;
};

const roleBadge = (role: 'user' | 'admin') =>
  role === 'admin' ? <Badge tone="accent">Админ</Badge> : <Badge>Хэрэглэгч</Badge>;

/** Grant or remove admin access, through a review → confirm dialog. */
export function RoleForm({ userId, name, role, isSelf }: RoleFormProps) {
  const isAdmin = role === 'admin';
  const nextRole = isAdmin ? 'user' : 'admin';
  const locked = isSelf && isAdmin;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {isAdmin
          ? 'Энэ хэрэглэгч админ самбарт нэвтэрч, бүх өгөгдлийг харах эрхтэй.'
          : 'Энгийн хэрэглэгч. Зөвхөн мобайл аппаар өөрийн мэдээллээ хардаг.'}
      </p>
      <ConfirmFlow
        trigger={{
          label: isAdmin ? 'Админ эрхийг хасах' : 'Админ болгох',
          variant: isAdmin ? 'danger' : 'primary',
          disabled: locked,
          icon: <ShieldIcon className="size-4" />,
        }}
        tone={isAdmin ? 'expense' : 'warn'}
        icon={<ShieldIcon className="size-5" />}
        title={isAdmin ? 'Админ эрхийг хасах' : 'Админ эрх олгох'}
        subtitle={
          isAdmin
            ? 'Энэ хүн админ самбарт нэвтрэх боломжгүй болно'
            : 'Бүх хэрэглэгчийн санхүүгийн мэдээллийг харах эрх'
        }
        review={
          <>
            <ReviewRow label="Хэрэглэгч">{name}</ReviewRow>
            <ReviewRow label="Одоогийн эрх">{roleBadge(role)}</ReviewRow>
            <ReviewRow label="Шинэ эрх">{roleBadge(nextRole)}</ReviewRow>
            <ReviewRow label="Харах мэдээлэл">
              {isAdmin ? 'Зөвхөн өөрийнх' : 'Бүх хэрэглэгчийн гүйлгээ, хадгаламж'}
            </ReviewRow>
          </>
        }
        summary={
          <div>
            <p className="text-xs text-muted">{name}-ийн эрх</p>
            <p className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
              {isAdmin ? 'Админ' : 'Хэрэглэгч'} <span className="text-muted">→</span> {isAdmin ? 'Хэрэглэгч' : 'Админ'}
            </p>
          </div>
        }
        checks={
          isAdmin
            ? ['Энэ хүн админ самбарт дахин нэвтрэх боломжгүй болохыг ойлгож байна']
            : [
                'Энэ хүнийг таньдаг, итгэдэг',
                'Админ бүх хэрэглэгчийн мэдээллийг харж, ангилал засна гэдгийг ойлгож байна',
              ]
        }
        notice="Өөрчлөлт шууд хүчинтэй болно. Дараа нь энэ хуудаснаас буцааж өөрчилж болно."
        confirmLabel={isAdmin ? 'Эрхийг хасах' : 'Эрх олгох'}
        action={changeRole}
        fields={{ userId, role: nextRole }}
      />
      {locked ? <p className="text-xs text-muted">Өөрийнхөө админ эрхийг хасах боломжгүй.</p> : null}
    </div>
  );
}
