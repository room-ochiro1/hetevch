// Hand-maintained to match supabase/migrations until `pnpm db:types` can run against a
// database (needs Docker for local Supabase, or a linked project). That command overwrites it.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TransactionKind = Database['public']['Enums']['transaction_kind'];
type InterestCompounding = Database['public']['Enums']['interest_compounding'];
type CurrencyCode = Database['public']['Enums']['currency_code'];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          birth_year: number | null;
          role: Database['public']['Enums']['user_role'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          birth_year?: number | null;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          birth_year?: number | null;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          kind: TransactionKind;
          name: string;
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: TransactionKind;
          name: string;
          icon: string;
          color: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: TransactionKind;
          name?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          kind: TransactionKind;
          amount: number;
          category_id: string;
          note: string | null;
          occurred_on: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          kind: TransactionKind;
          amount: number;
          category_id: string;
          note?: string | null;
          occurred_on?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: TransactionKind;
          amount?: number;
          category_id?: string;
          note?: string | null;
          occurred_on?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_kind_fkey';
            columns: ['category_id', 'kind'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id', 'kind'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      savings_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          bank: string | null;
          principal: number;
          annual_rate: number;
          compounding: InterestCompounding;
          start_date: string;
          term_months: number | null;
          color: string;
          icon: string;
          currency: CurrencyCode;
          goal_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          bank?: string | null;
          principal?: number;
          annual_rate?: number;
          compounding?: InterestCompounding;
          start_date?: string;
          term_months?: number | null;
          color?: string;
          icon?: string;
          currency?: CurrencyCode;
          goal_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          bank?: string | null;
          principal?: number;
          annual_rate?: number;
          compounding?: InterestCompounding;
          start_date?: string;
          term_months?: number | null;
          color?: string;
          icon?: string;
          currency?: CurrencyCode;
          goal_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'savings_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      savings_entries: {
        Row: {
          id: string;
          account_id: string;
          user_id: string;
          amount: number;
          note: string | null;
          occurred_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          user_id?: string;
          amount: number;
          note?: string | null;
          occurred_on?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          user_id?: string;
          amount?: number;
          note?: string | null;
          occurred_on?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'savings_entries_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'savings_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'savings_entries_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      device_links: {
        Row: {
          key_hash: string;
          user_id: string;
          platform: 'android' | 'ios' | 'web';
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          key_hash: string;
          user_id: string;
          platform: 'android' | 'ios' | 'web';
          created_at?: string;
          last_seen_at?: string;
        };
        Update: {
          key_hash?: string;
          user_id?: string;
          platform?: 'android' | 'ios' | 'web';
          created_at?: string;
          last_seen_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'device_links_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      legal_consents: {
        Row: {
          id: string;
          user_id: string;
          terms_version: string;
          privacy_version: string;
          accepted_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          terms_version: string;
          privacy_version: string;
          accepted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          terms_version?: string;
          privacy_version?: string;
          accepted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'legal_consents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      delete_my_account: { Args: never; Returns: undefined };
      claim_device: {
        Args: { device_key: string; device_platform: 'android' | 'ios' | 'web' };
        Returns: { restored: boolean; needs_onboarding: boolean }[];
      };
      my_finance_totals: {
        Args: { p_from?: string; p_to?: string };
        Returns: { income: number; expense: number; tx_count: number }[];
      };
      admin_finance_totals: {
        Args: { p_from?: string; p_to?: string };
        Returns: { income: number; expense: number; tx_count: number; user_count: number }[];
      };
    };
    Enums: {
      user_role: 'user' | 'admin';
      transaction_kind: 'income' | 'expense';
      interest_compounding: 'simple' | 'monthly';
      currency_code: 'MNT' | 'USD';
    };
    CompositeTypes: { [_ in never]: never };
  };
};
