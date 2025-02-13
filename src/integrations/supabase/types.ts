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
      analyst_recommendations: {
        Row: {
          action: string | null
          analyst_company: string | null
          analyst_name: string | null
          created_at: string | null
          date: string
          id: string
          previous_recommendation: string | null
          previous_target_price: number | null
          recommendation: string | null
          symbol: string
          target_price: number | null
        }
        Insert: {
          action?: string | null
          analyst_company?: string | null
          analyst_name?: string | null
          created_at?: string | null
          date: string
          id?: string
          previous_recommendation?: string | null
          previous_target_price?: number | null
          recommendation?: string | null
          symbol: string
          target_price?: number | null
        }
        Update: {
          action?: string | null
          analyst_company?: string | null
          analyst_name?: string | null
          created_at?: string | null
          date?: string
          id?: string
          previous_recommendation?: string | null
          previous_target_price?: number | null
          recommendation?: string | null
          symbol?: string
          target_price?: number | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          ceo: string | null
          country: string | null
          currency: string | null
          description: string | null
          exchange: string | null
          fulltimeemployees: number | null
          image: string | null
          industry: string | null
          ipodate: string | null
          name: string | null
          sector: string | null
          symbol: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          ceo?: string | null
          country?: string | null
          currency?: string | null
          description?: string | null
          exchange?: string | null
          fulltimeemployees?: number | null
          image?: string | null
          industry?: string | null
          ipodate?: string | null
          name?: string | null
          sector?: string | null
          symbol: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          ceo?: string | null
          country?: string | null
          currency?: string | null
          description?: string | null
          exchange?: string | null
          fulltimeemployees?: number | null
          image?: string | null
          industry?: string | null
          ipodate?: string | null
          name?: string | null
          sector?: string | null
          symbol?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      consensus_ratings: {
        Row: {
          average_target_price: number | null
          buy_ratings: number | null
          consensus_rating: string | null
          consensus_target_price: number | null
          highest_target_price: number | null
          hold_ratings: number | null
          lowest_target_price: number | null
          median_target_price: number | null
          sell_ratings: number | null
          strong_buy_ratings: number | null
          strong_sell_ratings: number | null
          symbol: string
          total_analysts: number | null
          updated_at: string | null
        }
        Insert: {
          average_target_price?: number | null
          buy_ratings?: number | null
          consensus_rating?: string | null
          consensus_target_price?: number | null
          highest_target_price?: number | null
          hold_ratings?: number | null
          lowest_target_price?: number | null
          median_target_price?: number | null
          sell_ratings?: number | null
          strong_buy_ratings?: number | null
          strong_sell_ratings?: number | null
          symbol: string
          total_analysts?: number | null
          updated_at?: string | null
        }
        Update: {
          average_target_price?: number | null
          buy_ratings?: number | null
          consensus_rating?: string | null
          consensus_target_price?: number | null
          highest_target_price?: number | null
          hold_ratings?: number | null
          lowest_target_price?: number | null
          median_target_price?: number | null
          sell_ratings?: number | null
          strong_buy_ratings?: number | null
          strong_sell_ratings?: number | null
          symbol?: string
          total_analysts?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_metrics: {
        Row: {
          calendar_year: number
          created_at: string | null
          date: string
          debt_to_equity: number | null
          dividend_yield: number | null
          eps_growth: number | null
          fcf_growth: number | null
          free_cash_flow_yield: number | null
          id: string
          net_income_growth: number | null
          net_margin: number | null
          operating_margin: number | null
          pe_ratio: number | null
          period: Database["public"]["Enums"]["period_type"]
          price_to_book: number | null
          revenue_growth: number | null
          roa: number | null
          roe: number | null
          symbol: string
        }
        Insert: {
          calendar_year: number
          created_at?: string | null
          date: string
          debt_to_equity?: number | null
          dividend_yield?: number | null
          eps_growth?: number | null
          fcf_growth?: number | null
          free_cash_flow_yield?: number | null
          id?: string
          net_income_growth?: number | null
          net_margin?: number | null
          operating_margin?: number | null
          pe_ratio?: number | null
          period: Database["public"]["Enums"]["period_type"]
          price_to_book?: number | null
          revenue_growth?: number | null
          roa?: number | null
          roe?: number | null
          symbol: string
        }
        Update: {
          calendar_year?: number
          created_at?: string | null
          date?: string
          debt_to_equity?: number | null
          dividend_yield?: number | null
          eps_growth?: number | null
          fcf_growth?: number | null
          free_cash_flow_yield?: number | null
          id?: string
          net_income_growth?: number | null
          net_margin?: number | null
          operating_margin?: number | null
          pe_ratio?: number | null
          period?: Database["public"]["Enums"]["period_type"]
          price_to_book?: number | null
          revenue_growth?: number | null
          roa?: number | null
          roe?: number | null
          symbol?: string
        }
        Relationships: []
      }
      financial_ratios: {
        Row: {
          asset_turnover: number | null
          calendar_year: number
          cash_ratio: number | null
          created_at: string | null
          current_ratio: number | null
          date: string
          debt_equity_ratio: number | null
          debt_ratio: number | null
          dividend_payout_ratio: number | null
          dividend_yield: number | null
          ev_to_ebitda: number | null
          gross_margin_ratio: number | null
          id: string
          interest_coverage: number | null
          inventory_turnover: number | null
          net_profit_margin: number | null
          operating_margin_ratio: number | null
          pe_ratio: number | null
          peg_ratio: number | null
          period: Database["public"]["Enums"]["period_type"]
          price_to_book_ratio: number | null
          price_to_sales_ratio: number | null
          quick_ratio: number | null
          receivables_turnover: number | null
          return_on_assets: number | null
          return_on_capital_employed: number | null
          return_on_equity: number | null
          symbol: string
        }
        Insert: {
          asset_turnover?: number | null
          calendar_year: number
          cash_ratio?: number | null
          created_at?: string | null
          current_ratio?: number | null
          date: string
          debt_equity_ratio?: number | null
          debt_ratio?: number | null
          dividend_payout_ratio?: number | null
          dividend_yield?: number | null
          ev_to_ebitda?: number | null
          gross_margin_ratio?: number | null
          id?: string
          interest_coverage?: number | null
          inventory_turnover?: number | null
          net_profit_margin?: number | null
          operating_margin_ratio?: number | null
          pe_ratio?: number | null
          peg_ratio?: number | null
          period: Database["public"]["Enums"]["period_type"]
          price_to_book_ratio?: number | null
          price_to_sales_ratio?: number | null
          quick_ratio?: number | null
          receivables_turnover?: number | null
          return_on_assets?: number | null
          return_on_capital_employed?: number | null
          return_on_equity?: number | null
          symbol: string
        }
        Update: {
          asset_turnover?: number | null
          calendar_year?: number
          cash_ratio?: number | null
          created_at?: string | null
          current_ratio?: number | null
          date?: string
          debt_equity_ratio?: number | null
          debt_ratio?: number | null
          dividend_payout_ratio?: number | null
          dividend_yield?: number | null
          ev_to_ebitda?: number | null
          gross_margin_ratio?: number | null
          id?: string
          interest_coverage?: number | null
          inventory_turnover?: number | null
          net_profit_margin?: number | null
          operating_margin_ratio?: number | null
          pe_ratio?: number | null
          peg_ratio?: number | null
          period?: Database["public"]["Enums"]["period_type"]
          price_to_book_ratio?: number | null
          price_to_sales_ratio?: number | null
          quick_ratio?: number | null
          receivables_turnover?: number | null
          return_on_assets?: number | null
          return_on_capital_employed?: number | null
          return_on_equity?: number | null
          symbol?: string
        }
        Relationships: []
      }
      financial_statements: {
        Row: {
          calendar_year: number
          capital_expenditure: number | null
          cash_and_equivalents: number | null
          cost_of_revenue: number | null
          created_at: string | null
          date: string
          dividend_payments: number | null
          free_cash_flow: number | null
          gross_profit: number | null
          id: string
          inventory: number | null
          net_income: number | null
          net_receivables: number | null
          operating_cash_flow: number | null
          operating_expenses: number | null
          operating_income: number | null
          period: Database["public"]["Enums"]["period_type"]
          revenue: number | null
          short_term_investments: number | null
          stock_repurchase: number | null
          symbol: string
          total_assets: number | null
          total_equity: number | null
          total_liabilities: number | null
        }
        Insert: {
          calendar_year: number
          capital_expenditure?: number | null
          cash_and_equivalents?: number | null
          cost_of_revenue?: number | null
          created_at?: string | null
          date: string
          dividend_payments?: number | null
          free_cash_flow?: number | null
          gross_profit?: number | null
          id?: string
          inventory?: number | null
          net_income?: number | null
          net_receivables?: number | null
          operating_cash_flow?: number | null
          operating_expenses?: number | null
          operating_income?: number | null
          period: Database["public"]["Enums"]["period_type"]
          revenue?: number | null
          short_term_investments?: number | null
          stock_repurchase?: number | null
          symbol: string
          total_assets?: number | null
          total_equity?: number | null
          total_liabilities?: number | null
        }
        Update: {
          calendar_year?: number
          capital_expenditure?: number | null
          cash_and_equivalents?: number | null
          cost_of_revenue?: number | null
          created_at?: string | null
          date?: string
          dividend_payments?: number | null
          free_cash_flow?: number | null
          gross_profit?: number | null
          id?: string
          inventory?: number | null
          net_income?: number | null
          net_receivables?: number | null
          operating_cash_flow?: number | null
          operating_expenses?: number | null
          operating_income?: number | null
          period?: Database["public"]["Enums"]["period_type"]
          revenue?: number | null
          short_term_investments?: number | null
          stock_repurchase?: number | null
          symbol?: string
          total_assets?: number | null
          total_equity?: number | null
          total_liabilities?: number | null
        }
        Relationships: []
      }
      growth_metrics: {
        Row: {
          assets_growth: number | null
          calendar_year: number
          capex_growth: number | null
          created_at: string | null
          date: string
          debt_growth: number | null
          ebit_growth: number | null
          eps_growth: number | null
          equity_growth: number | null
          free_cash_flow_growth: number | null
          gross_profit_growth: number | null
          id: string
          net_income_growth: number | null
          operating_cash_flow_growth: number | null
          operating_income_growth: number | null
          period: Database["public"]["Enums"]["period_type"]
          revenue_growth: number | null
          symbol: string
        }
        Insert: {
          assets_growth?: number | null
          calendar_year: number
          capex_growth?: number | null
          created_at?: string | null
          date: string
          debt_growth?: number | null
          ebit_growth?: number | null
          eps_growth?: number | null
          equity_growth?: number | null
          free_cash_flow_growth?: number | null
          gross_profit_growth?: number | null
          id?: string
          net_income_growth?: number | null
          operating_cash_flow_growth?: number | null
          operating_income_growth?: number | null
          period: Database["public"]["Enums"]["period_type"]
          revenue_growth?: number | null
          symbol: string
        }
        Update: {
          assets_growth?: number | null
          calendar_year?: number
          capex_growth?: number | null
          created_at?: string | null
          date?: string
          debt_growth?: number | null
          ebit_growth?: number | null
          eps_growth?: number | null
          equity_growth?: number | null
          free_cash_flow_growth?: number | null
          gross_profit_growth?: number | null
          id?: string
          net_income_growth?: number | null
          operating_cash_flow_growth?: number | null
          operating_income_growth?: number | null
          period?: Database["public"]["Enums"]["period_type"]
          revenue_growth?: number | null
          symbol?: string
        }
        Relationships: []
      }
      portfolio_stocks: {
        Row: {
          avg_price: number
          created_at: string
          current_price: number | null
          gain_loss: number | null
          gain_loss_percent: number | null
          id: string
          market_value: number | null
          name: string
          percent_of_portfolio: number | null
          portfolio_id: string | null
          shares: number
          ticker: string
          updated_at: string
        }
        Insert: {
          avg_price: number
          created_at?: string
          current_price?: number | null
          gain_loss?: number | null
          gain_loss_percent?: number | null
          id?: string
          market_value?: number | null
          name: string
          percent_of_portfolio?: number | null
          portfolio_id?: string | null
          shares: number
          ticker: string
          updated_at?: string
        }
        Update: {
          avg_price?: number
          created_at?: string
          current_price?: number | null
          gain_loss?: number | null
          gain_loss_percent?: number | null
          id?: string
          market_value?: number | null
          name?: string
          percent_of_portfolio?: number | null
          portfolio_id?: string | null
          shares?: number
          ticker?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_stocks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          portfolio_id: string | null
          price_paid: number
          start_date: string | null
          subscriber_id: string | null
          subscription_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          portfolio_id?: string | null
          price_paid: number
          start_date?: string | null
          subscriber_id?: string | null
          subscription_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          portfolio_id?: string | null
          price_paid?: number
          start_date?: string | null
          subscriber_id?: string | null
          subscription_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_subscriptions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean | null
          is_public: boolean | null
          name: string
          total_value: number | null
          updated_at: string
          user_id: string | null
          yearly_performance: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean | null
          is_public?: boolean | null
          name: string
          total_value?: number | null
          updated_at?: string
          user_id?: string | null
          yearly_performance?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean | null
          is_public?: boolean | null
          name?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string | null
          yearly_performance?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_targets: {
        Row: {
          last_updated: string | null
          number_of_analysts: number | null
          symbol: string
          target_consensus: string | null
          target_high: number | null
          target_low: number | null
          target_mean: number | null
        }
        Insert: {
          last_updated?: string | null
          number_of_analysts?: number | null
          symbol: string
          target_consensus?: string | null
          target_high?: number | null
          target_low?: number | null
          target_mean?: number | null
        }
        Update: {
          last_updated?: string | null
          number_of_analysts?: number | null
          symbol?: string
          target_consensus?: string | null
          target_high?: number | null
          target_low?: number | null
          target_mean?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          social_linkedin: string | null
          social_twitter: string | null
          subscriber_count: number | null
          subscribers: number | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          social_linkedin?: string | null
          social_twitter?: string | null
          subscriber_count?: number | null
          subscribers?: number | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          social_linkedin?: string | null
          social_twitter?: string | null
          subscriber_count?: number | null
          subscribers?: number | null
          updated_at?: string
          username?: string | null
          website?: string | null
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
      stock_peers: {
        Row: {
          created_at: string | null
          peer_symbol: string
          symbol: string
        }
        Insert: {
          created_at?: string | null
          peer_symbol: string
          symbol: string
        }
        Update: {
          created_at?: string | null
          peer_symbol?: string
          symbol?: string
        }
        Relationships: []
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
      subscription_pricing: {
        Row: {
          annual_price: number
          created_at: string
          id: string
          monthly_price: number
          updated_at: string
        }
        Insert: {
          annual_price?: number
          created_at?: string
          id?: string
          monthly_price?: number
          updated_at?: string
        }
        Update: {
          annual_price?: number
          created_at?: string
          id?: string
          monthly_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      ttm_ratios: {
        Row: {
          asset_turnover_ttm: number | null
          dividend_yield_ttm: number | null
          ev_to_ebitda_ttm: number | null
          gross_margin_ttm: number | null
          inventory_turnover_ttm: number | null
          net_profit_margin_ttm: number | null
          operating_margin_ttm: number | null
          pe_ratio_ttm: number | null
          price_to_book_ttm: number | null
          price_to_sales_ttm: number | null
          receivables_turnover_ttm: number | null
          return_on_assets_ttm: number | null
          return_on_equity_ttm: number | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          asset_turnover_ttm?: number | null
          dividend_yield_ttm?: number | null
          ev_to_ebitda_ttm?: number | null
          gross_margin_ttm?: number | null
          inventory_turnover_ttm?: number | null
          net_profit_margin_ttm?: number | null
          operating_margin_ttm?: number | null
          pe_ratio_ttm?: number | null
          price_to_book_ttm?: number | null
          price_to_sales_ttm?: number | null
          receivables_turnover_ttm?: number | null
          return_on_assets_ttm?: number | null
          return_on_equity_ttm?: number | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          asset_turnover_ttm?: number | null
          dividend_yield_ttm?: number | null
          ev_to_ebitda_ttm?: number | null
          gross_margin_ttm?: number | null
          inventory_turnover_ttm?: number | null
          net_profit_margin_ttm?: number | null
          operating_margin_ttm?: number | null
          pe_ratio_ttm?: number | null
          price_to_book_ttm?: number | null
          price_to_sales_ttm?: number | null
          receivables_turnover_ttm?: number | null
          return_on_assets_ttm?: number | null
          return_on_equity_ttm?: number | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      watchlist_stocks: {
        Row: {
          created_at: string
          id: string
          metrics: Json | null
          name: string
          ticker: string
          updated_at: string
          watchlist_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json | null
          name: string
          ticker: string
          updated_at?: string
          watchlist_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json | null
          name?: string
          ticker?: string
          updated_at?: string
          watchlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_stocks_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
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
      period_type: "annual" | "quarter" | "ttm"
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
