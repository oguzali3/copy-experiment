
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#2b2b35] dark:text-gray-200 dark:border-gray-700"
          placeholder="Search companies..."
        />
      </div>

      {isOpen && (searchQuery.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2b2b35] rounded-lg shadow-lg border dark:border-gray-700 max-h-[400px] overflow-y-auto z-50">
          {isLoading && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Searching...
            </div>
          )}
          {!isLoading && searchQuery.length < 2 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Type at least 2 characters to search...
            </div>
          )}
          {!isLoading && searchQuery.length >= 2 && results.length === 0 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No companies found.
            </div>
          )}
          {results.map((company) => (
            <div
              key={company.symbol}
              onClick={() => {
                onCompanySelect({
                  ticker: company.symbol,
                  name: company.name,
                });
                setSearchQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium dark:text-gray-200">{company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.symbol} {company.exchangeShortName ? `• ${company.exchangeShortName}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
