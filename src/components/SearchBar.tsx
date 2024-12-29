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
import { useState, useEffect } from "react";
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

  useEffect(() => {
    let isActive = true;

    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log('Starting search with query:', searchQuery);

      try {
        const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
          body: { endpoint: 'search', query: searchQuery.replace(/\$/g, '').trim() }
        });

        console.log('API response received:', { data, error });

        if (error) {
          console.error('Error fetching stocks:', error);
          throw error;
        }

        if (!data || !Array.isArray(data)) {
          console.warn('Unexpected data format:', data);
          if (isActive) setResults([]);
          return;
        }

        console.log('Setting results:', data);
        if (isActive) {
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (isActive) setResults([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (open && searchQuery.trim()) {
        fetchResults();
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, open]);

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
                <div className="flex items-center justify-center py-6">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : searchQuery.length === 0 ? (
                "Start typing to search..."
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