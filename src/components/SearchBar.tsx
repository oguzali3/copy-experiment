import { Search, Loader } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarProps {
  onStockSelect: (stock: any) => void;
}

export const SearchBar = ({ onStockSelect }: SearchBarProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, any[]>>({});

  // Memoized search function
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
      if (open) {
        fetchResults();
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, open, searchStocks, cache]);

  const handleSelect = (stock: any) => {
    console.log('Stock selected:', stock);
    onStockSelect({
      name: stock.name,
      ticker: stock.symbol,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changesPercentage,
      marketCap: stock.marketCap,
      summary: stock.description || `${stock.name} is a publicly traded company.`,
    });
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(true)}
        aria-label="Open stock search"
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search stocks...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md" aria-label="Search stocks dialog">
          <CommandInput 
            placeholder="Search stocks..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            autoFocus
            aria-label="Search stocks input"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : searchQuery.length === 0 ? (
                "Start typing to search..."
              ) : searchQuery.length < 2 ? (
                "Type at least 2 characters to search..."
              ) : results.length === 0 ? (
                "No stocks found. Try searching with the company name or ticker symbol."
              ) : (
                "No results found."
              )}
            </CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading="Stocks">
                {results.map((stock: any) => (
                  <CommandItem
                    key={stock.symbol}
                    onSelect={() => handleSelect(stock)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-accent cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{stock.name}</p>
                      <p className="text-xs text-muted-foreground">${stock.symbol}</p>
                    </div>
                    {stock.price && (
                      <div className="text-right">
                        <p className="text-sm font-medium">${stock.price}</p>
                        <p className={`text-xs ${parseFloat(stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.change} ({stock.changesPercentage}%)
                        </p>
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};