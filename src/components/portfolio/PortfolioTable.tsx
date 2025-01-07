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
import { ArrowUpIcon, ArrowDownIcon, Trash2, Check, X } from "lucide-react";
import { Stock } from "./types";
import { useState } from "react";

interface PortfolioTableProps {
  stocks: Stock[];
  onDeletePosition: (ticker: string) => void;
  onUpdatePosition: (ticker: string, shares: number, avgPrice: number) => void;
}

export const PortfolioTable = ({ stocks, onDeletePosition, onUpdatePosition }: PortfolioTableProps) => {
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ shares: 0, avgPrice: 0 });

  const formatNumber = (value: number | undefined, isPercentage = false) => {
    if (value === undefined || value === null) return '-';
    return isPercentage ? `${value.toFixed(2)}%` : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">% of Portfolio</TableHead>
            <TableHead className="text-right">Gain/Loss</TableHead>
            <TableHead className="text-right">Gain/Loss %</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
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
        </TableBody>
      </Table>
    </div>
  );
};