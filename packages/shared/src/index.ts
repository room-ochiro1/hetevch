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

export const USER_ROLES = ['user', 'admin'] as const satisfies readonly UserRole[];

export { formatMoney } from './format';
