import { SearchIcon } from '@/components/ui/icons';

type UsersFiltersProps = {
  search?: string;
  role?: string;
};

const fieldClass =
  'rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent';

/** Plain GET form: filters live in the URL, so they work without JavaScript and can be shared. */
export function UsersFilters({ search, role }: UsersFiltersProps) {
  return (
    <form action="/users" method="get" role="search" className="flex flex-wrap gap-2">
      <label className="relative min-w-60 flex-1">
        <span className="sr-only">Нэр эсвэл имэйлээр хайх</span>
        <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-muted">
          <SearchIcon />
        </span>
        <input
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Нэр эсвэл имэйлээр хайх"
          className={`${fieldClass} w-full pl-9`}
        />
      </label>
      <label>
        <span className="sr-only">Эрх</span>
        <select name="role" defaultValue={role ?? ''} className={fieldClass}>
          <option value="">Бүх эрх</option>
          <option value="user">Хэрэглэгч</option>
          <option value="admin">Админ</option>
        </select>
      </label>
      <button
        type="submit"
        className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90"
      >
        Хайх
      </button>
    </form>
  );
}
