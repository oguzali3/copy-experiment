import { Search } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarProps {
  onStockSelect: (stock: any) => void;
}

export const SearchBar = ({ onStockSelect }: SearchBarProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Implement debouncing with a shorter delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150); // Reduced to 150ms for faster response

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Remove "$" and trim whitespace from the search query
  const sanitizedQuery = debouncedQuery.replace(/\$/g, '').trim().toLowerCase();

  const { data: stocksData, isLoading } = useQuery({
    queryKey: ['search-stocks', sanitizedQuery],
    queryFn: async () => {
      if (!sanitizedQuery) return [];
      
      console.log('Searching with query:', sanitizedQuery);
      
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'search', query: sanitizedQuery }
      });

      if (error) {
        console.error('Error fetching stocks:', error);
        throw error;
      }

      return data || [];
    },
    enabled: sanitizedQuery.length > 0,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: false,
    // Add these options for better performance
    cacheTime: 1000 * 60 * 10, // Keep cache for 10 minutes
    keepPreviousData: true, // Show previous results while fetching new ones
  });

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
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search stocks...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search stocks..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                "Searching..."
              ) : debouncedQuery.length === 0 ? (
                "Start typing to search..."
              ) : stocksData?.length === 0 ? (
                "No stocks found. Try searching with the company name or ticker symbol."
              ) : (
                "No results found."
              )}
            </CommandEmpty>
            {stocksData && stocksData.length > 0 && (
              <CommandGroup heading="Stocks">
                {stocksData.map((stock: any) => (
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