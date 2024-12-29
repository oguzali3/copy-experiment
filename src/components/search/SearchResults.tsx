interface SearchResultProps {
  results: any[];
  onSelect: (stock: any) => void;
  searchQuery: string;
}

export const SearchResults = ({ results, onSelect, searchQuery }: SearchResultProps) => {
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <img 
                  src={`https://financialmodelingprep.com/image-stock/${stock.symbol}.png`} 
                  alt={`${stock.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  {stock.name}
                  <span className="text-gray-500">({stock.symbol})</span>
                </div>
              </div>
            </div>
            {stock.price && (
              <div className="text-right">
                <div className="text-sm font-medium">${stock.price}</div>
                <div className={`text-xs ${parseFloat(stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change} ({stock.changesPercentage}%)
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};