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
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'search',
          query: query.trim()
        }
      });

      if (error) throw error;
      setResults(data || []);
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