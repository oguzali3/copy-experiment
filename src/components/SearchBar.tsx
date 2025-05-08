
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";
import { useRef, useEffect } from "react";

interface SearchBarProps {
  onStockSelect: (stock: any) => void;
}

export const SearchBar = ({ onStockSelect }: SearchBarProps) => {
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen
  } = useSearch();

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

  const handleSelect = (stock: any) => {
    onStockSelect({
      name: stock.name,
      ticker: stock.symbol,
      price: stock.price?.toFixed(2) || "0.00",
      change: stock.change?.toFixed(2) || "0.00",
      changePercent: stock.changesPercentage?.toFixed(2) || "0.00",
      marketCap: stock.marketCap || "N/A",
      summary: stock.description || `${stock.name} is a publicly traded company.`,
    });
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <SearchInput
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value);
          setIsOpen(true);
        }}
        isLoading={isLoading}
      />

      {isOpen && (searchQuery.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2b2b35] rounded-lg shadow-lg border dark:border-gray-700 max-h-[400px] overflow-y-auto z-50">
          <SearchResults
            results={results}
            onSelect={handleSelect}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
};
