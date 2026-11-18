export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          name: string
          owner_id: string | null
          sort_order: number
        }
        Insert: {
          color: string
          created_at?: string
          icon: string
          id?: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          name: string
          owner_id?: string | null
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          name?: string
          owner_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_links: {
        Row: {
          created_at: string
          key_hash: string
          last_seen_at: string
          platform: string
          user_id: string
        }
        Insert: {
          created_at?: string
          key_hash: string
          last_seen_at?: string
          platform: string
          user_id: string
        }
        Update: {
          created_at?: string
          key_hash?: string
          last_seen_at?: string
          platform?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_consents: {
        Row: {
          accepted_at: string
          id: string
          privacy_version: string
          terms_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          privacy_version: string
          terms_version: string
          user_id?: string
        }
        Update: {
          accepted_at?: string
          id?: string
          privacy_version?: string
          terms_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      savings_accounts: {
        Row: {
          annual_rate: number
          bank: string | null
          color: string
          compounding: Database["public"]["Enums"]["interest_compounding"]
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          goal_amount: number | null
          icon: string
          id: string
          name: string
          principal: number
          start_date: string
          term_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_rate?: number
          bank?: string | null
          color?: string
          compounding?: Database["public"]["Enums"]["interest_compounding"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          goal_amount?: number | null
          icon?: string
          id?: string
          name: string
          principal?: number
          start_date?: string
          term_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          annual_rate?: number
          bank?: string | null
          color?: string
          compounding?: Database["public"]["Enums"]["interest_compounding"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          goal_amount?: number | null
          icon?: string
          id?: string
          name?: string
          principal?: number
          start_date?: string
          term_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_entries: {
        Row: {
          account_id: string
          amount: number
          base_amount: number | null
          created_at: string
          id: string
          note: string | null
          occurred_on: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          base_amount?: number | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          amount?: number
          base_amount?: number | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "savings_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          note: string | null
          occurred_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          note?: string | null
          occurred_on?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          note?: string | null
          occurred_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_kind_fkey"
            columns: ["category_id", "kind"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "kind"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_activity_heatmap: {
        Args: { period_days?: number }
        Returns: {
          hour: number
          tx_count: number
          weekday: number
        }[]
      }
      admin_activity_heatmap_by_age: {
        Args: { p_age_band?: string; period_days?: number }
        Returns: {
          hour: number
          tx_count: number
          weekday: number
        }[]
      }
      admin_activity_heatmap_by_segment: {
        Args: { p_age_band?: string; p_sex?: string; period_days?: number }
        Returns: {
          hour: number
          tx_count: number
          weekday: number
        }[]
      }
      admin_age_bands: {
        Args: { period_days?: number }
        Returns: {
          active_users: number
          band: string
          expense: number
          income: number
          saved_mnt: number
          saved_usd: number
          savers: number
          users: number
        }[]
      }
      admin_age_bands_by_sex: {
        Args: { p_sex?: string; period_days?: number }
        Returns: {
          active_users: number
          band: string
          expense: number
          income: number
          saved_mnt: number
          saved_usd: number
          savers: number
          users: number
        }[]
      }
      admin_band_detail: {
        Args: { p_band: string; period_days?: number }
        Returns: Json
      }
      admin_category_by_age: {
        Args: {
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          period_days?: number
        }
        Returns: {
          band: string
          category_id: string
          icon: string
          name: string
          total: number
          tx_count: number
        }[]
      }
      admin_category_by_age_by_sex: {
        Args: {
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          p_sex?: string
          period_days?: number
        }
        Returns: {
          band: string
          category_id: string
          icon: string
          name: string
          total: number
          tx_count: number
        }[]
      }
      admin_category_by_gender: {
        Args: {
          p_age_band?: string
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          period_days?: number
        }
        Returns: {
          category_id: string
          color: string
          gender: string
          icon: string
          name: string
          total: number
          tx_count: number
          users: number
        }[]
      }
      admin_category_detail: {
        Args: {
          p_age_band?: string
          p_category_id: string
          period_days?: number
        }
        Returns: Json
      }
      admin_category_detail_by_segment: {
        Args: {
          p_age_band?: string
          p_category_id: string
          p_sex?: string
          period_days?: number
        }
        Returns: Json
      }
      admin_category_totals: {
        Args: {
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          period_days?: number
        }
        Returns: {
          category_id: string
          icon: string
          name: string
          total: number
          tx_count: number
        }[]
      }
      admin_category_totals_by_age: {
        Args: {
          p_age_band?: string
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          period_days?: number
        }
        Returns: {
          category_id: string
          icon: string
          name: string
          total: number
          tx_count: number
        }[]
      }
      admin_category_totals_by_segment: {
        Args: {
          p_age_band?: string
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          p_sex?: string
          period_days?: number
        }
        Returns: {
          category_id: string
          icon: string
          name: string
          total: number
          tx_count: number
        }[]
      }
      admin_daily_activity: {
        Args: { period_days?: number }
        Returns: {
          day: string
          expense: number
          income: number
          new_users: number
          tx_count: number
        }[]
      }
      admin_daily_metrics: {
        Args: { period_days?: number }
        Returns: {
          active_users: number
          day: string
          expense: number
          income: number
          new_users: number
          tx_count: number
        }[]
      }
      admin_daily_metrics_by_age: {
        Args: { p_age_band?: string; period_days?: number }
        Returns: {
          active_users: number
          day: string
          expense: number
          income: number
          new_users: number
          tx_count: number
        }[]
      }
      admin_daily_metrics_by_segment: {
        Args: { p_age_band?: string; p_sex?: string; period_days?: number }
        Returns: {
          active_users: number
          day: string
          expense: number
          income: number
          new_users: number
          tx_count: number
        }[]
      }
      admin_day_detail: {
        Args: { p_age_band?: string; p_day: string }
        Returns: Json
      }
      admin_day_detail_by_segment: {
        Args: { p_age_band?: string; p_day: string; p_sex?: string }
        Returns: Json
      }
      admin_finance_totals: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          expense: number
          income: number
          tx_count: number
          user_count: number
        }[]
      }
      admin_finance_totals_by_age: {
        Args: { p_age_band?: string; p_from?: string; p_to?: string }
        Returns: {
          expense: number
          income: number
          tx_count: number
          user_count: number
        }[]
      }
      admin_finance_totals_by_segment: {
        Args: {
          p_age_band?: string
          p_from?: string
          p_sex?: string
          p_to?: string
        }
        Returns: {
          expense: number
          income: number
          tx_count: number
          user_count: number
        }[]
      }
      admin_gender_breakdown: {
        Args: { p_age_band?: string; period_days?: number }
        Returns: {
          active_users: number
          expense: number
          expense_tx: number
          gender: string
          income: number
          income_tx: number
          saved: number
          savers: number
          users: number
        }[]
      }
      admin_gender_by_age: {
        Args: {
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          period_days?: number
        }
        Returns: {
          band: string
          gender: string
          total: number
          users: number
        }[]
      }
      admin_overview: {
        Args: never
        Returns: {
          active_users_30d: number
          new_users_7d: number
          total_transactions: number
          total_users: number
        }[]
      }
      admin_overview_by_age: {
        Args: { p_age_band?: string }
        Returns: {
          total_users: number
        }[]
      }
      admin_overview_by_segment: {
        Args: { p_age_band?: string; p_sex?: string }
        Returns: {
          total_users: number
        }[]
      }
      admin_savings_cards: {
        Args: { max_rows?: number }
        Returns: {
          account_id: string
          annual_rate: number
          band: string
          color: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          deposited: number
          email: string
          entries: number
          full_name: string
          goal_amount: number
          icon: string
          last_moved_on: string
          name: string
          start_date: string
          term_months: number
          user_id: string
        }[]
      }
      admin_savings_cards_by_sex: {
        Args: { max_rows?: number; p_sex?: string }
        Returns: {
          account_id: string
          annual_rate: number
          band: string
          color: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          deposited: number
          email: string
          entries: number
          full_name: string
          goal_amount: number
          icon: string
          last_moved_on: string
          name: string
          start_date: string
          term_months: number
          user_id: string
        }[]
      }
      admin_savings_flow: {
        Args: { period_days?: number }
        Returns: {
          currency: Database["public"]["Enums"]["currency_code"]
          deposits: number
          week_start: string
          withdrawals: number
        }[]
      }
      admin_savings_flow_by_age: {
        Args: { p_age_band?: string; period_days?: number }
        Returns: {
          currency: Database["public"]["Enums"]["currency_code"]
          deposits: number
          week_start: string
          withdrawals: number
        }[]
      }
      admin_savings_flow_by_segment: {
        Args: { p_age_band?: string; p_sex?: string; period_days?: number }
        Returns: {
          currency: Database["public"]["Enums"]["currency_code"]
          deposits: number
          week_start: string
          withdrawals: number
        }[]
      }
      admin_top_users: {
        Args: { max_rows?: number; period_days?: number }
        Returns: {
          email: string
          expense: number
          full_name: string
          income: number
          last_active: string
          tx_count: number
          user_id: string
        }[]
      }
      admin_top_users_by_age: {
        Args: { max_rows?: number; p_age_band?: string; period_days?: number }
        Returns: {
          birth_year: number
          email: string
          expense: number
          full_name: string
          income: number
          last_active: string
          tx_count: number
          user_id: string
        }[]
      }
      admin_top_users_by_segment: {
        Args: {
          max_rows?: number
          p_age_band?: string
          p_sex?: string
          period_days?: number
        }
        Returns: {
          birth_year: number
          email: string
          expense: number
          full_name: string
          income: number
          last_active: string
          tx_count: number
          user_id: string
        }[]
      }
      admin_user_category_totals: {
        Args: {
          p_kind?: Database["public"]["Enums"]["transaction_kind"]
          period_days?: number
          target_user_id: string
        }
        Returns: {
          category_id: string
          icon: string
          name: string
          total: number
          tx_count: number
        }[]
      }
      admin_user_daily: {
        Args: { period_days?: number; target_user_id: string }
        Returns: {
          day: string
          expense: number
          income: number
        }[]
      }
      admin_user_summary: {
        Args: { target_user_id: string }
        Returns: {
          expense: number
          income: number
          last_occurred_on: string
          tx_count: number
        }[]
      }
      admin_weekday_by_age: {
        Args: { period_days?: number }
        Returns: {
          band: string
          expense: number
          income: number
          tx_count: number
          weekday: number
        }[]
      }
      admin_weekday_by_age_by_sex: {
        Args: { p_sex?: string; period_days?: number }
        Returns: {
          band: string
          expense: number
          income: number
          tx_count: number
          weekday: number
        }[]
      }
      age_band: { Args: { p_birth_year: number }; Returns: string }
      claim_device: {
        Args: { device_key: string; device_platform: string }
        Returns: {
          needs_onboarding: boolean
          restored: boolean
        }[]
      }
      delete_my_account: { Args: never; Returns: undefined }
      in_age_band: {
        Args: { p_age_band: string; p_birth_year: number }
        Returns: boolean
      }
      in_segment: {
        Args: {
          p_age_band: string
          p_birth_year: number
          p_gender: string
          p_sex: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      my_balance: { Args: never; Returns: number }
      my_finance_totals: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          expense: number
          income: number
          tx_count: number
        }[]
      }
      research_period_start: { Args: { period_days: number }; Returns: string }
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      currency_code: "MNT" | "USD"
      interest_compounding: "simple" | "monthly"
      transaction_kind: "income" | "expense"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      currency_code: ["MNT", "USD"],
      interest_compounding: ["simple", "monthly"],
      transaction_kind: ["income", "expense"],
      user_role: ["user", "admin"],
    },
  },
} as const
