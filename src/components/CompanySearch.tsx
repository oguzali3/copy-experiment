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
import { supabase } from "@/integrations/supabase/client";

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'search', 
          query: query.toUpperCase()
        }
      });

      if (error) throw error;
      
      const transformedData = Array.isArray(data) ? data.map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        exchange: item.exchangeShortName || item.stockExchange,
        type: item.type
      })) : [];
      
      console.log('Search results:', transformedData);
      setResults(transformedData);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStocks(searchQuery);
    }
  };

  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Search companies..." 
          value={searchQuery}
          onKeyDown={handleKeyPress}
          onValueChange={(value) => {
            setSearchQuery(value);
          }}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              "Searching..."
            ) : searchQuery.length < 2 ? (
              "Type at least 2 characters and press Enter to search..."
            ) : results.length === 0 ? (
              "No companies found."
            ) : null}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Companies">
              {results.map((company) => (
                <CommandItem
                  key={company.symbol}
                  onSelect={() => {
                    onCompanySelect({
                      ticker: company.symbol,
                      name: company.name,
                    });
                    setSearchQuery("");
                    setResults([]);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.symbol} {company.exchange ? `• ${company.exchange}` : ''}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
};