import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, any[]>>({});
  const [isOpen, setIsOpen] = useState(false);

  const searchStocks = useCallback(async (query: string) => {
    if (cache[query]) {
      console.log('Returning cached results for:', query);
      return cache[query];
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'search', query }
      });

      if (error) throw error;

      setCache(prev => ({
        ...prev,
        [query]: data
      }));

      return data;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }, [cache]);

  useEffect(() => {
    let isActive = true;

    const fetchResults = async () => {
      const trimmedQuery = searchQuery.trim().toLowerCase();
      
      if (!trimmedQuery) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      if (trimmedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      console.log('Starting search with query:', trimmedQuery);

      try {
        if (cache[trimmedQuery]) {
          console.log('Using cached results for:', trimmedQuery);
          setResults(cache[trimmedQuery]);
          setIsLoading(false);
          return;
        }

        const searchResults = await searchStocks(trimmedQuery);
        
        if (isActive) {
          console.log('Setting results:', searchResults);
          setResults(searchResults || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (isActive) setResults([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, searchStocks, cache]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen
  };
};