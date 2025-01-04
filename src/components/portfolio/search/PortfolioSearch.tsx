import { useEffect } from "react";
import { usePortfolioSearch } from "@/hooks/usePortfolioSearch";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface PortfolioSearchProps {
  onStockSelect: (stock: any) => void;
}

export const PortfolioSearch = ({ onStockSelect }: PortfolioSearchProps) => {
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    searchStocks
  } = usePortfolioSearch();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchStocks(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStocks]);

  return (
    <div className="relative w-full">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left font-normal"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search stocks...</span>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search stocks..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.length < 2 
                ? "Type at least 2 characters to search..."
                : isLoading 
                  ? "Searching..."
                  : "No stocks found."}
            </CommandEmpty>
            <CommandGroup heading="Stocks">
              {results.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  onSelect={() => {
                    onStockSelect({
                      ticker: stock.symbol,
                      name: stock.companyName || stock.name,
                      shares: 0,
                      avgPrice: stock.price || 0,
                      currentPrice: stock.price || 0,
                      marketValue: 0,
                      percentOfPortfolio: 0,
                      gainLoss: 0,
                      gainLossPercent: 0
                    });
                    setSearchQuery("");
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">{stock.companyName || stock.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stock.symbol} • {stock.exchangeShortName}
                      </p>
                    </div>
                  </div>
                  {stock.price && (
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium">${stock.price}</p>
                      {stock.changes && (
                        <p className={`text-xs ${parseFloat(stock.changes) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.changes > 0 ? '+' : ''}{stock.changes}%
                        </p>
                      )}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};