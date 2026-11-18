import type { Database } from './database.types';

export type { Database, Json } from './database.types';

type PublicSchema = Database['public'];

/** Row type of a table in the public schema, e.g. `TableRow<'profiles'>`. */
export type TableRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];

/** Insert payload of a table in the public schema. */
export type TableInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];

/** Update payload of a table in the public schema. */
export type TableUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Profile = TableRow<'profiles'>;
export type UserRole = PublicSchema['Enums']['user_role'];
export type Category = TableRow<'categories'>;
export type Transaction = TableRow<'transactions'>;
export type SavingsAccount = TableRow<'savings_accounts'>;

/** The category fields shown next to a transaction. */
export type CategorySummary = Pick<Category, 'id' | 'name' | 'icon' | 'color'>;

/** A transaction with its category embedded, as lists show it. */
export type TransactionListItem = Pick<
  Transaction,
  'id' | 'kind' | 'amount' | 'note' | 'occurred_on' | 'created_at' | 'category_id'
> & { category: CategorySummary | null };

/** PostgREST select string that yields `TransactionListItem`. */
export const TRANSACTION_LIST_SELECT =
  'id, kind, amount, note, occurred_on, created_at, category_id, category:categories(id, name, icon, color)';

export const USER_ROLES = ['user', 'admin'] as const satisfies readonly UserRole[];

export { formatMoney } from './format';
export * from './dates';
export * from './finance';
export * from './currency';
export * from './interest';
export * from './savings';
export * from './periods';
export * from './age';
