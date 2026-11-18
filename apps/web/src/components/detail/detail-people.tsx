import { ageFromBirthYear } from '@hetevch/shared';
import Link from 'next/link';

import type { PersonRef } from '@/lib/dal/detail-shapes';

/** "Бат · 27 нас" — the name with the age when the person gave a birth year. */
export function personLabel(person: PersonRef): string {
  return person.birthYear ? `${person.name} · ${ageFromBirthYear(person.birthYear)} нас` : person.name;
}

export type PersonRow = PersonRef & { value: string; note?: string };

/** People ranked by something; each opens that user's page. */
export function PeopleList({ people, empty }: { people: PersonRow[]; empty: string }) {
  if (people.length === 0) return <p className="py-4 text-center text-sm text-muted">{empty}</p>;
  return (
    <ol className="flex flex-col">
      {people.map((person, index) => (
        <li key={person.userId} className="border-b border-border last:border-0">
          <Link
            href={`/users/${person.userId}`}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2"
          >
            <span className="w-5 shrink-0 text-right text-xs text-muted tabular-nums">{index + 1}</span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text uppercase">
              {person.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{personLabel(person)}</span>
              {person.note ? <span className="block truncate text-xs text-muted">{person.note}</span> : null}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{person.value}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export type TxRow = {
  id: string;
  when: string;
  person: PersonRef;
  what: string;
  note: string | null;
  amount: string;
  tone: 'income' | 'expense';
};

/** Individual transactions, newest first: who, what for, how much. */
export function TxTable({ rows, empty }: { rows: TxRow[]; empty: string }) {
  if (rows.length === 0) return <p className="py-4 text-center text-sm text-muted">{empty}</p>;
  return (
    <div className="-mx-4 overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-y border-border text-xs text-muted">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">Хэзээ</th>
            <th scope="col" className="px-4 py-2 font-medium">Хэрэглэгч</th>
            <th scope="col" className="px-4 py-2 font-medium">Юунд</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">Дүн</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2 text-xs whitespace-nowrap text-muted">{row.when}</td>
              <td className="px-4 py-2">
                <Link href={`/users/${row.person.userId}`} className="hover:underline">
                  {personLabel(row.person)}
                </Link>
              </td>
              <td className="px-4 py-2">
                {row.what}
                {row.note ? <span className="block max-w-56 truncate text-xs text-muted">{row.note}</span> : null}
              </td>
              <td
                className={`px-4 py-2 text-right font-medium whitespace-nowrap tabular-nums ${
                  row.tone === 'income' ? 'text-income' : ''
                }`}
              >
                {row.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
