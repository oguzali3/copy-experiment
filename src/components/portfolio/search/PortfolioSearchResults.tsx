interface SearchResultProps {
  results: any[];
  onSelect: (stock: any) => void;
  searchQuery: string;
}

export const PortfolioSearchResults = ({ results, onSelect, searchQuery }: SearchResultProps) => {
  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        {searchQuery.length < 2 
          ? "Type at least 2 characters to search..."
          : "No results found"}
      </div>
    );
  }

  return (
    <div>
      {results.map((stock) => (
        <div
          key={stock.symbol}
          onClick={() => onSelect(stock)}
          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                {stock.name}
                <span className="text-gray-500">({stock.symbol})</span>
              </div>
              <div className="text-xs text-gray-500">
                {stock.sector} • {stock.industry}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                Market Cap: ${(stock.marketCap / 1e9).toFixed(2)}B
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};