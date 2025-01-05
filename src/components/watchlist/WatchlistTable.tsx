import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Stock } from "./WatchlistContent";

interface WatchlistTableProps {
  stocks: Stock[];
  selectedMetrics: string[];
  availableMetrics: Array<{
    id: string;
    name: string;
  }>;
  onDeleteTicker: (ticker: string) => void;
}

export const WatchlistTable = ({
  stocks,
  selectedMetrics,
  availableMetrics,
  onDeleteTicker,
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
        {stocks.map((stock) => (
          <TableRow key={stock.ticker}>
            <TableCell className="font-medium">{stock.ticker}</TableCell>
            {selectedMetrics.map((metricId) => (
              <TableCell key={metricId}>
                {stock.metrics?.[metricId] || "-"}
              </TableCell>
            ))}
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDeleteTicker(stock.ticker)}
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};