import { Search, Loader } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarProps {
  onStockSelect: (stock: any) => void;
}

export const SearchBar = ({ onStockSelect }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, any[]>>({});
  const [isOpen, setIsOpen] = useState(false);

  // Memoized search function with caching
  const searchStocks = useCallback(async (query: string) => {
    // Check cache first
    if (cache[query]) {
      console.log('Returning cached results for:', query);
      return cache[query];
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'search', query }
      });

      if (error) throw error;

      // Cache the results
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

      // Don't search for very short terms
      if (trimmedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      console.log('Starting search with query:', trimmedQuery);

      try {
        // Check cache first for immediate results
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

  const handleSelect = (stock: any) => {
    onStockSelect({
      name: stock.name,
      ticker: stock.symbol,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changesPercentage,
      marketCap: stock.marketCap,
      summary: stock.description || `${stock.name} is a publicly traded company.`,
    });
    setSearchQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search stocks..."
        />
      </div>

      {isOpen && (searchQuery.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-[400px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              {searchQuery.length < 2 
                ? "Type at least 2 characters to search..."
                : "No results found"}
            </div>
          ) : (
            <div>
              {results.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleSelect(stock)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{stock.name}</div>
                      <div className="text-xs text-gray-500">{stock.symbol}</div>
                    </div>
                    {stock.price && (
                      <div className="text-right">
                        <div className="text-sm font-medium">${stock.price}</div>
                        <div className={`text-xs ${parseFloat(stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.change} ({stock.changesPercentage}%)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};