import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";

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
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <SearchInput
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value);
          setIsOpen(true);
        }}
        isLoading={isLoading}
      />

      {isOpen && (searchQuery.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-[400px] overflow-y-auto z-50">
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