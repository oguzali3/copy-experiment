import { useEffect } from "react";
import { usePortfolioSearch } from "@/hooks/usePortfolioSearch";
import { Search, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortfolioSearchProps {
  onStockSelect: (stock: any) => void;
}

export const PortfolioSearch = ({ onStockSelect }: PortfolioSearchProps) => {
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search stocks..."
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {searchQuery.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-[400px] overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              {searchQuery.length < 2 
                ? "Type at least 2 characters to search..."
                : isLoading 
                  ? "Searching..."
                  : "No results found"}
            </div>
          ) : (
            <div>
              {results.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
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
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">{stock.companyName || stock.name}</p>
                        <p className="text-xs text-gray-500">
                          {stock.symbol} • {stock.exchangeShortName}
                        </p>
                      </div>
                    </div>
                    {stock.price && (
                      <div className="text-right">
                        <p className="text-sm font-medium">${stock.price}</p>
                        {stock.changes && (
                          <p className={`text-xs ${parseFloat(stock.changes) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.changes > 0 ? '+' : ''}{stock.changes}%
                          </p>
                        )}
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