export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_screens: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      screen_criteria: {
        Row: {
          created_at: string
          id: string
          metric_id: string
          operator: Database["public"]["Enums"]["metric_operator"]
          screen_id: string | null
          value_max: number | null
          value_min: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_id: string
          operator: Database["public"]["Enums"]["metric_operator"]
          screen_id?: string | null
          value_max?: number | null
          value_min?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_id?: string
          operator?: Database["public"]["Enums"]["metric_operator"]
          screen_id?: string | null
          value_max?: number | null
          value_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "screen_criteria_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "saved_screens"
            referencedColumns: ["id"]
          },
        ]
      }
      stocks: {
        Row: {
          country: string | null
          current_ratio: number | null
          debt_to_equity: number | null
          dividend_yield: number | null
          ebitda: number | null
          eps_growth_3y: number | null
          eps_growth_ttm: number | null
          ev_to_ebitda: number | null
          exchange: string | null
          free_cash_flow: number | null
          gross_margin: number | null
          gross_profit: number | null
          industry: string | null
          interest_coverage: number | null
          last_updated: string | null
          market_cap: number | null
          name: string | null
          net_income: number | null
          net_margin: number | null
          operating_cash_flow: number | null
          operating_income: number | null
          operating_margin: number | null
          payout_ratio: number | null
          pe_ratio: number | null
          price_to_book: number | null
          revenue: number | null
          revenue_growth: number | null
          revenue_growth_3y: number | null
          revenue_growth_ttm: number | null
          roa: number | null
          roe: number | null
          sector: string | null
          symbol: string
          total_assets: number | null
          total_equity: number | null
          total_liabilities: number | null
        }
        Insert: {
          country?: string | null
          current_ratio?: number | null
          debt_to_equity?: number | null
          dividend_yield?: number | null
          ebitda?: number | null
          eps_growth_3y?: number | null
          eps_growth_ttm?: number | null
          ev_to_ebitda?: number | null
          exchange?: string | null
          free_cash_flow?: number | null
          gross_margin?: number | null
          gross_profit?: number | null
          industry?: string | null
          interest_coverage?: number | null
          last_updated?: string | null
          market_cap?: number | null
          name?: string | null
          net_income?: number | null
          net_margin?: number | null
          operating_cash_flow?: number | null
          operating_income?: number | null
          operating_margin?: number | null
          payout_ratio?: number | null
          pe_ratio?: number | null
          price_to_book?: number | null
          revenue?: number | null
          revenue_growth?: number | null
          revenue_growth_3y?: number | null
          revenue_growth_ttm?: number | null
          roa?: number | null
          roe?: number | null
          sector?: string | null
          symbol: string
          total_assets?: number | null
          total_equity?: number | null
          total_liabilities?: number | null
        }
        Update: {
          country?: string | null
          current_ratio?: number | null
          debt_to_equity?: number | null
          dividend_yield?: number | null
          ebitda?: number | null
          eps_growth_3y?: number | null
          eps_growth_ttm?: number | null
          ev_to_ebitda?: number | null
          exchange?: string | null
          free_cash_flow?: number | null
          gross_margin?: number | null
          gross_profit?: number | null
          industry?: string | null
          interest_coverage?: number | null
          last_updated?: string | null
          market_cap?: number | null
          name?: string | null
          net_income?: number | null
          net_margin?: number | null
          operating_cash_flow?: number | null
          operating_income?: number | null
          operating_margin?: number | null
          payout_ratio?: number | null
          pe_ratio?: number | null
          price_to_book?: number | null
          revenue?: number | null
          revenue_growth?: number | null
          revenue_growth_3y?: number | null
          revenue_growth_ttm?: number | null
          roa?: number | null
          roe?: number | null
          sector?: string | null
          symbol?: string
          total_assets?: number | null
          total_equity?: number | null
          total_liabilities?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      metric_operator:
        | "greater_than"
        | "less_than"
        | "equal_to"
        | "between"
        | "not_equal_to"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
