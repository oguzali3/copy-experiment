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
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchStocks = async () => {
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
        const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'search', 
            query: trimmedQuery
          }
        });

        if (error) throw error;
        
        console.log('Search results:', data);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchStocks();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Search companies..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading ? (
            <CommandEmpty>Searching...</CommandEmpty>
          ) : searchQuery.length < 2 ? (
            <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>No companies found.</CommandEmpty>
          ) : (
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
                        {company.symbol} {company.exchangeShortName ? `• ${company.exchangeShortName}` : ''}
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