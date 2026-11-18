import { WalletIcon } from '@/components/ui/icons';

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-accent text-on-accent">
        <WalletIcon className="size-5"/>
      </span>
      <div className="leading-tight">
        <p className="font-semibold">Хэтэвч</p>
        <p className="text-xs text-muted">Админ самбар</p>
      </div>
    </div>
  );
}
