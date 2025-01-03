import { Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'search', query }
      });

      if (error) throw error;
      setResults(data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (company: any) => {
    onCompanySelect(company);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search companies..."
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && (searchQuery.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-[400px] overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              {searchQuery.length < 2 
                ? "Type at least 2 characters to search..."
                : "No companies found"}
            </div>
          ) : (
            <div>
              {results.map((company) => (
                <div
                  key={company.symbol}
                  onClick={() => handleSelect(company)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {company.name}
                        <span className="text-gray-500">({company.symbol})</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.exchangeShortName}
                      </div>
                    </div>
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