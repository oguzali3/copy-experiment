import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon, ArrowDownIcon, Trash2, Check, X, ArrowUpDown, Search } from "lucide-react";
import { Stock } from "./types";
import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// In PortfolioTable.tsx
interface PortfolioTableProps {
  stocks: Stock[];
  onDeletePosition: (ticker: string) => void;
  onUpdatePosition: (ticker: string, shares: number, avgPrice: number) => void;
  excludedTickers?: string[]; // Add this line
  onToggleExclude?: (ticker: string) => void; // Add this line
}

type SortField = 'ticker' | 'name' | 'shares' | 'avgPrice' | 'currentPrice' | 
                 'marketValue' | 'percentOfPortfolio' | 'gainLoss' | 'gainLossPercent';
type SortDirection = 'asc' | 'desc';

export const PortfolioTable = ({ stocks, onDeletePosition, onUpdatePosition }: PortfolioTableProps) => {
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ shares: 0, avgPrice: 0 });
  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterText, setFilterText] = useState('');
  const [filterField, setFilterField] = useState<'all' | SortField>('all');
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>(stocks);

  // Apply sorting and filtering whenever dependencies change
  useEffect(() => {
    let result = [...stocks];
    
    // Apply filtering
    if (filterText.trim()) {
      const searchText = filterText.toLowerCase();
      result = result.filter(stock => {
        if (filterField === 'all') {
          return (
            stock.ticker.toLowerCase().includes(searchText) ||
            stock.name.toLowerCase().includes(searchText)
          );
        } else if (filterField === 'ticker') {
          return stock.ticker.toLowerCase().includes(searchText);
        } else if (filterField === 'name') {
          return stock.name.toLowerCase().includes(searchText);
        } else {
          // For numeric fields, try to see if the value starts with the search text
          const value = stock[filterField];
          return value.toString().toLowerCase().includes(searchText);
        }
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'ticker' || sortField === 'name') {
        comparison = a[sortField].localeCompare(b[sortField]);
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredStocks(result);
  }, [stocks, sortField, sortDirection, filterText, filterField]);

  const formatNumber = (value: number | undefined, isPercentage = false) => {
    // Check if value is undefined, null, or not a number
    if (value == null || isNaN(value)) return '-';
    
    return isPercentage 
      ? `${Number(value).toFixed(2)}%` 
      : `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock.ticker);
    setEditValues({
      shares: stock.shares,
      avgPrice: stock.avgPrice
    });
  };

  const handleSave = () => {
    if (editingStock) {
      const currentStock = stocks.find(s => s.ticker === editingStock);
      if (currentStock && editValues.shares >= 0) {
        onUpdatePosition(editingStock, editValues.shares, editValues.avgPrice);
      }
      setEditingStock(null);
    }
  };

  const handleCancel = () => {
    setEditingStock(null);
  };

  const handleSharesChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditValues(prev => ({ ...prev, shares: numValue }));
    }
  };

  const handlePriceChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditValues(prev => ({ ...prev, avgPrice: numValue }));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending for values, ascending for text
      setSortField(field);
      setSortDirection(field === 'ticker' || field === 'name' ? 'asc' : 'desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="ml-1 h-4 w-4" /> : 
      <ArrowDownIcon className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search positions..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={filterField}
          onValueChange={(value) => setFilterField(value as 'all' | SortField)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search in..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            <SelectItem value="ticker">Ticker</SelectItem>
            <SelectItem value="name">Company Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center">
                  Ticker {renderSortIcon('ticker')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Company {renderSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('shares')}
              >
                <div className="flex items-center justify-end">
                  Shares {renderSortIcon('shares')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('avgPrice')}
              >
                <div className="flex items-center justify-end">
                  Avg Price {renderSortIcon('avgPrice')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('currentPrice')}
              >
                <div className="flex items-center justify-end">
                  Current Price {renderSortIcon('currentPrice')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('marketValue')}
              >
                <div className="flex items-center justify-end">
                  Market Value {renderSortIcon('marketValue')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('percentOfPortfolio')}
              >
                <div className="flex items-center justify-end">
                  % of Portfolio {renderSortIcon('percentOfPortfolio')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('gainLoss')}
              >
                <div className="flex items-center justify-end">
                  Gain/Loss {renderSortIcon('gainLoss')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('gainLossPercent')}
              >
                <div className="flex items-center justify-end">
                  Gain/Loss % {renderSortIcon('gainLossPercent')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => (
              <TableRow key={stock.ticker}>
                <TableCell className="font-medium">{stock.ticker}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell className="text-right">
                  {editingStock === stock.ticker ? (
                    <Input
                      type="number"
                      value={editValues.shares}
                      onChange={(e) => handleSharesChange(e.target.value)}
                      className="w-24 text-right cursor-text hover:border-blue-500 focus:border-blue-500"
                      min="0"
                      step="any"
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:text-blue-600 hover:underline" 
                      onClick={() => handleEdit(stock)}
                      title="Click to edit shares"
                    >
                      {stock.shares.toLocaleString()}
                    </div>
                  )}
                </TableCell>
                {/* Rest of the table cells remain the same */}
                <TableCell className="text-right">
                  {editingStock === stock.ticker ? (
                    <Input
                      type="number"
                      value={editValues.avgPrice}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-24 text-right cursor-text hover:border-blue-500 focus:border-blue-500"
                      min="0"
                      step="any"
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:text-blue-600 hover:underline" 
                      onClick={() => handleEdit(stock)}
                      title="Click to edit average price"
                    >
                      {formatNumber(stock.avgPrice)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">{formatNumber(stock.currentPrice)}</TableCell>
                <TableCell className="text-right">{formatNumber(stock.marketValue)}</TableCell>
                <TableCell className="text-right">{formatNumber(stock.percentOfPortfolio, true)}</TableCell>
                <TableCell className="text-right">
                  <span className={stock.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatNumber(Math.abs(stock.gainLoss))}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end ${stock.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.gainLossPercent >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {formatNumber(Math.abs(stock.gainLossPercent), true)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {editingStock === stock.ticker ? (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={handleSave}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeletePosition(stock.ticker)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredStocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  No positions match your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};