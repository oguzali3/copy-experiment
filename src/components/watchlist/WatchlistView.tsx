import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Copy, PlusCircle, ChevronDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WatchlistViewProps {
  watchlist: {
    id: string;
    name: string;
    stocks: Stock[];
    selectedMetrics: string[];
  };
  onAddWatchlist: () => void;
  onDeleteWatchlist: (id: string) => void;
}

const availableMetrics = [
  { id: "ntmPE", name: "NTM P/E", description: "Next Twelve Months Price to Earnings" },
  { id: "ntmTevEbit", name: "NTM TEV/EBIT", description: "Next Twelve Months Total Enterprise Value to EBIT" },
  { id: "ntmMcFcf", name: "NTM MC/FCF", description: "Next Twelve Months Market Cap to Free Cash Flow" },
  { id: "ntmPCfps", name: "NTM P/CFPS", description: "Next Twelve Months Price to Cash Flow Per Share" },
  { id: "ntmPFfo", name: "NTM P/FFO", description: "Next Twelve Months Price to Funds From Operations" },
  { id: "ntmPAffo", name: "NTM P/AFFO", description: "Next Twelve Months Price to Adjusted Funds From Operations" },
];

export const WatchlistView = ({ watchlist, onAddWatchlist, onDeleteWatchlist }: WatchlistViewProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(watchlist.selectedMetrics);

  const handleMetricSelect = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
  };

  const handleCopyTable = () => {
    toast.success("Table copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{watchlist.name}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline">
          Watchlist Settings
        </Button>
        <Button variant="outline" className="text-green-600 border-green-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Ticker
        </Button>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" onClick={handleCopyTable}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Table
          </Button>
          <Button variant="outline" className="text-green-600 border-green-600" onClick={onAddWatchlist}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Watchlist
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-700">Watchlist Columns</span>
          {selectedMetrics.map((metricId) => {
            const metric = availableMetrics.find(m => m.id === metricId);
            return (
              <Badge key={metricId} variant="secondary" className="bg-gray-100">
                {metric?.name}
                <button
                  onClick={() => handleRemoveMetric(metricId)}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
        <Select onValueChange={handleMetricSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Add metric..." />
          </SelectTrigger>
          <SelectContent>
            {availableMetrics.map((metric) => (
              <SelectItem
                key={metric.id}
                value={metric.id}
                disabled={selectedMetrics.includes(metric.id)}
              >
                <div className="flex flex-col">
                  <span>{metric.name}</span>
                  <span className="text-xs text-gray-500">{metric.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          {watchlist.stocks.map((stock) => (
            <TableRow key={stock.ticker}>
              <TableCell className="font-medium">{stock.ticker}</TableCell>
              {selectedMetrics.map((metricId) => (
                <TableCell key={metricId}>
                  {stock.metrics?.[metricId] || "-"}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between">
        <Button className="bg-[#f5a623] hover:bg-[#f5a623]/90 text-white">
          Set as Active Watchlist
        </Button>
        <Button 
          variant="destructive"
          onClick={() => onDeleteWatchlist(watchlist.id)}
        >
          Delete Watchlist
        </Button>
      </div>
    </div>
  );
};