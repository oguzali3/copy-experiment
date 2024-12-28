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
import { useState } from "react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarProps {
  onStockSelect: (stock: any) => void;
}

export const SearchBar = ({ onStockSelect }: SearchBarProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stocksData, isLoading } = useQuery({
    queryKey: ['search-stocks', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'search', query: searchQuery }
      });

      if (error) {
        console.error('Error fetching stocks:', error);
        return [];
      }

      return data || [];
    },
    enabled: searchQuery.length > 0
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
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Searching..." : "No stocks found."}
            </CommandEmpty>
            <CommandGroup heading="Stocks">
              {stocksData?.map((stock: any) => (
                <CommandItem
                  key={stock.symbol}
                  onSelect={() => handleSelect(stock)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{stock.name}</p>
                    <p className="text-xs text-muted-foreground">${stock.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${stock.price}</p>
                    <p className={`text-xs ${parseFloat(stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change} ({stock.changesPercentage}%)
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};