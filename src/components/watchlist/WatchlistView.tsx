// src/components/watchlist/WatchlistView.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CompanySearch } from "../CompanySearch";
import { WatchlistHeader } from "./WatchlistHeader";
import { WatchlistMetrics } from "./WatchlistMetrics";
import { WatchlistTable } from "./WatchlistTable";
import { Watchlist } from "@/types/watchlist";
import { toast } from "sonner";
import { MetricInfo } from "@/components/watchlist/types";

// Updated interface including categorizedMetrics
interface WatchlistViewProps {
  watchlist: Watchlist;
  availableMetrics: MetricInfo[];
  categorizedMetrics?: Array<{
    category: string;
    metrics: Array<{ id: string; name: string; description: string }>;
  }>;
  isLoading: boolean;
  onAddWatchlist: () => void;
  onDeleteWatchlist: (id: string) => void;
  onUpdateWatchlist: (watchlist: Watchlist) => void;
  onAddStock: (stock: { ticker: string; name: string }) => Promise<void>;
  onDeleteStock: (ticker: string) => Promise<void>;
  onRefreshMetrics: () => Promise<void>;
  onAddMetric: (metricId: string) => Promise<void>;
  onRemoveMetric: (metricId: string) => Promise<void>;
}

export const WatchlistView = ({
  watchlist,
  availableMetrics,
  categorizedMetrics, 
  isLoading,
  onAddWatchlist,
  onDeleteWatchlist,
  onUpdateWatchlist,
  onAddStock,
  onDeleteStock,
  onRefreshMetrics,
  onAddMetric,
  onRemoveMetric
}: WatchlistViewProps) => {
  const [isAddingTicker, setIsAddingTicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateOperation, setUpdateOperation] = useState("");

  const handleMetricSelect = async (metricId: string) => {
    try {
      setIsUpdating(true);
      setUpdateOperation("Adding metric");
      await onAddMetric(metricId);
    } catch (error) {
      console.error('Error selecting metric:', error);
    } finally {
      setIsUpdating(false);
      setUpdateOperation("");
    }
  };

  const handleRemoveMetric = async (metricId: string) => {
    try {
      setIsUpdating(true);
      setUpdateOperation("Removing metric");
      await onRemoveMetric(metricId);
    } catch (error) {
      console.error('Error removing metric:', error);
    } finally {
      setIsUpdating(false);
      setUpdateOperation("");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddTicker = async (company: any) => {
    try {
      setIsUpdating(true);
      setUpdateOperation(`Adding ${company.ticker}`);
      await onAddStock({ ticker: company.ticker, name: company.name });
      setIsAddingTicker(false);
    } catch (error) {
      console.error('Error adding ticker:', error);
    } finally {
      setIsUpdating(false);
      setUpdateOperation("");
    }
  };

  const handleDeleteTicker = async (ticker: string) => {
    try {
      setIsUpdating(true);
      setUpdateOperation(`Removing ${ticker}`);
      await onDeleteStock(ticker);
    } catch (error) {
      console.error('Error deleting ticker:', error);
    } finally {
      setIsUpdating(false);
      setUpdateOperation("");
    }
  };

  const handleRefreshMetrics = async () => {
    try {
      setIsUpdating(true);
      setUpdateOperation("Refreshing metrics");
      await onRefreshMetrics();
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setIsUpdating(false);
      setUpdateOperation("");
    }
  };

  const handleCopyTable = () => {
    // Create a formatted string representation of the table
    const header = ["Ticker", ...watchlist.selectedMetrics.map(id => 
      availableMetrics.find(m => m.id === id)?.name || id
    )].join("\t");
    
    const rows = watchlist.stocks.map(stock => {
      const cells = [stock.ticker];
      for (const metricId of watchlist.selectedMetrics) {
        const value = stock.metrics?.[metricId] !== null 
          ? stock.metrics?.[metricId]?.toString() 
          : "-";
        cells.push(value || "-");
      }
      return cells.join("\t");
    });

    const tableText = [header, ...rows].join("\n");
    
    // Copy to clipboard
    navigator.clipboard.writeText(tableText);
    toast.success("Table copied to clipboard");
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading overlay for operations */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span>{updateOperation || "Updating..."}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <WatchlistHeader
          watchlistName={watchlist.name}
          onAddWatchlist={onAddWatchlist}
          onCopyTable={handleCopyTable}
          onUpdateWatchlistName={(name) => onUpdateWatchlist({ ...watchlist, name })}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshMetrics}
          disabled={isLoading || isUpdating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isUpdating) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Dialog open={isAddingTicker} onOpenChange={setIsAddingTicker}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-green-600 border-green-600" disabled={isUpdating}>
              Add Ticker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ticker to Watchlist</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <CompanySearch onCompanySelect={handleAddTicker} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pass categorizedMetrics to WatchlistMetrics */}
      <WatchlistMetrics
        selectedMetrics={watchlist.selectedMetrics}
        onMetricSelect={handleMetricSelect}
        onRemoveMetric={handleRemoveMetric}
        availableMetrics={availableMetrics}
        categorizedMetrics={categorizedMetrics}
        isDisabled={isUpdating}
      />

      <WatchlistTable
        stocks={watchlist.stocks}
        selectedMetrics={watchlist.selectedMetrics}
        availableMetrics={availableMetrics}
        onDeleteTicker={handleDeleteTicker}
        isDisabled={isUpdating}
      />

      <div className="flex justify-end">
        <Button 
          variant="destructive"
          onClick={() => onDeleteWatchlist(watchlist.id)}
          disabled={isUpdating}
        >
          Delete Watchlist
        </Button>
      </div>
    </div>
  );
};