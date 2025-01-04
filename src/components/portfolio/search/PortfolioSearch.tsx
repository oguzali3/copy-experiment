import { usePortfolioSearch } from "@/hooks/usePortfolioSearch";
import { PortfolioSearchInput } from "./PortfolioSearchInput";
import { PortfolioSearchResults } from "./PortfolioSearchResults";
import { useRef, useEffect } from "react";

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

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchStocks(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStocks]);

  const handleSelect = (stock: any) => {
    onStockSelect({
      ticker: stock.symbol,
      name: stock.name,
      shares: 0,
      avgPrice: 0,
      currentPrice: 0, // This will be updated with real data later
      marketValue: 0,
      percentOfPortfolio: 0,
      gainLoss: 0,
      gainLossPercent: 0
    });
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <PortfolioSearchInput
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value);
          setIsOpen(true);
        }}
        isLoading={isLoading}
      />

      {isOpen && (searchQuery.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-[400px] overflow-y-auto z-50">
          <PortfolioSearchResults
            results={results}
            onSelect={handleSelect}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
};