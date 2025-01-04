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
import { Stock } from "./PortfolioContent";

interface PortfolioTableProps {
  stocks: Stock[];
  isLoading?: boolean;
  onDeletePosition: (ticker: string) => void;
}

export const PortfolioTable = ({ stocks, isLoading, onDeletePosition }: PortfolioTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="animate-pulse text-gray-500">Refreshing market data...</div>
        </div>
      )}
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
              <TableCell className="text-right">${stock.avgPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">${stock.currentPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">${stock.marketValue.toLocaleString()}</TableCell>
              <TableCell className="text-right">{stock.percentOfPortfolio.toFixed(2)}%</TableCell>
              <TableCell className="text-right">
                <span className={stock.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                  ${Math.abs(stock.gainLoss).toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className={`flex items-center justify-end ${stock.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.gainLossPercent >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(stock.gainLossPercent).toFixed(2)}%
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