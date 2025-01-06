import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, Trash2 } from "lucide-react";
import { Stock } from "./types";

interface PortfolioTableProps {
  stocks: Stock[];
  onDeletePosition: (ticker: string) => void;
}

export const PortfolioTable = ({ stocks, onDeletePosition }: PortfolioTableProps) => {
  const formatNumber = (value: number | undefined, isPercentage = false) => {
    if (value === undefined || value === null) return '-';
    return isPercentage ? `${value.toFixed(2)}%` : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
              <TableCell className="text-right">{stock.shares.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatNumber(stock.avgPrice)}</TableCell>
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDeletePosition(stock.ticker)}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};