import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { WatchlistStock } from "@/types/watchlist";

interface WatchlistTableProps {
  stocks: WatchlistStock[];
  selectedMetrics: string[];
  availableMetrics: Array<{
    id: string;
    name: string;
  }>;
  onDeleteTicker: (ticker: string) => void;
  isDisabled?: boolean; // New prop to disable interactions during operations
}

export const WatchlistTable = ({
  stocks,
  selectedMetrics,
  availableMetrics,
  onDeleteTicker,
  isDisabled = false
}: WatchlistTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          {selectedMetrics.map((metricId) => (
            <TableHead key={metricId}>
              {availableMetrics.find(m => m.id === metricId)?.name}
            </TableHead>
          ))}
          <TableHead className="text-right">Delete Ticker</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={selectedMetrics.length + 2} className="text-center py-8 text-gray-500">
              No tickers in this watchlist. Add a ticker to get started.
            </TableCell>
          </TableRow>
        ) : (
          stocks.map((stock) => (
            <TableRow key={stock.ticker}>
              <TableCell className="font-medium">{stock.ticker}</TableCell>
              {selectedMetrics.map((metricId) => (
                <TableCell key={metricId}>
                  {stock.metrics?.[metricId] !== undefined && stock.metrics?.[metricId] !== null 
                    ? stock.metrics[metricId] 
                    : "-"}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDeleteTicker(stock.ticker)}
                  disabled={isDisabled}
                  className={isDisabled ? 'cursor-not-allowed opacity-50' : ''}
                >
                  <Trash2 className={`h-4 w-4 ${isDisabled ? 'text-gray-300' : 'text-gray-500 hover:text-red-500'}`} />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};