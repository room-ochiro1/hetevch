import type { Database } from '@hetevch/shared';

type PublicSchema = Database['public'];
type TransactionKind = PublicSchema['Enums']['transaction_kind'];
type UserRole = PublicSchema['Enums']['user_role'];

/**
 * Admin-only RPCs from supabase/migrations/*_admin_dashboard.sql. They live here rather
 * than in @hetevch/shared because only the web dashboard calls them. Once `pnpm db:types`
 * has been run these keys also exist in `Database`, and the intersection stays valid.
 */
type AdminFunctions = {
  set_user_role: {
    Args: { target_user_id: string; new_role: UserRole };
    Returns: undefined;
  };
  admin_overview: {
    Args: never;
    Returns: {
      total_users: number;
      new_users_7d: number;
      active_users_30d: number;
      total_transactions: number;
    }[];
  };
  admin_daily_activity: {
    Args: { period_days?: number };
    Returns: { day: string; new_users: number; tx_count: number; income: number; expense: number }[];
  };
  admin_category_totals: {
    Args: { period_days?: number; p_kind?: TransactionKind };
    Returns: {
      category_id: string;
      name: string;
      icon: string;
      total: number;
      tx_count: number;
    }[];
  };
  admin_user_summary: {
    Args: { target_user_id: string };
    Returns: { tx_count: number; income: number; expense: number; last_occurred_on: string | null }[];
  };
  // From *_admin_analytics.sql.
  admin_daily_metrics: {
    Args: { period_days?: number };
    Returns: {
      day: string;
      new_users: number;
      active_users: number;
      tx_count: number;
      income: number;
      expense: number;
    }[];
  };
  admin_activity_heatmap: {
    Args: { period_days?: number };
    Returns: { weekday: number; hour: number; tx_count: number }[];
  };
  admin_top_users: {
    Args: { period_days?: number; max_rows?: number };
    Returns: {
      user_id: string;
      email: string | null;
      full_name: string | null;
      tx_count: number;
      income: number;
      expense: number;
      last_active: string;
    }[];
  };
  admin_user_daily: {
    Args: { target_user_id: string; period_days?: number };
    Returns: { day: string; income: number; expense: number }[];
  };
  admin_user_category_totals: {
    Args: { target_user_id: string; period_days?: number; p_kind?: TransactionKind };
    Returns: { category_id: string; name: string; icon: string; total: number; tx_count: number }[];
  };
};

export type AdminDatabase = Omit<Database, 'public'> & {
  public: Omit<PublicSchema, 'Functions'> & {
    Functions: PublicSchema['Functions'] & AdminFunctions;
  };
};
