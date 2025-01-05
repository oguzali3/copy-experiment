import { Json } from "@/integrations/supabase/types";

export type WatchlistStock = {
  id: string;
  watchlist_id: string | null;
  ticker: string;
  name: string;
  metrics: Json | null;
  created_at: string;
  updated_at: string;
  // UI-specific fields
  price?: number;
  change?: number;
  marketCap?: number;
};

export type Watchlist = {
  id: string;
  user_id: string | null;
  name: string;
  stocks: WatchlistStock[];
  selectedMetrics: string[];
  created_at: string;
  updated_at: string;
};