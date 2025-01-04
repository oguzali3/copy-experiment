import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePortfolioSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data: stocks, error } = await supabase
        .from('stocks')
        .select('symbol, name, sector, industry, market_cap')
        .ilike('symbol', `${query}%`)
        .or(`name.ilike.%${query}%`)
        .order('market_cap', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setResults(stocks || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    searchStocks
  };
};