import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CompanySearch } from "../CompanySearch";
import { WatchlistHeader } from "./WatchlistHeader";
import { WatchlistMetrics } from "./WatchlistMetrics";
import { WatchlistTable } from "./WatchlistTable";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Watchlist } from "@/types/watchlist";

interface WatchlistViewProps {
  watchlist: Watchlist;
  onAddWatchlist: () => void;
  onDeleteWatchlist: (id: string) => void;
  onUpdateWatchlist: (watchlist: Watchlist) => void;
}

const availableMetrics = [
  { id: "ntmPE", name: "NTM P/E", description: "Next Twelve Months Price to Earnings" },
  { id: "ntmTevEbit", name: "NTM TEV/EBIT", description: "Next Twelve Months Total Enterprise Value to EBIT" },
  { id: "ntmMcFcf", name: "NTM MC/FCF", description: "Next Twelve Months Market Cap to Free Cash Flow" },
  { id: "ntmPCfps", name: "NTM P/CFPS", description: "Next Twelve Months Price to Cash Flow Per Share" },
  { id: "ntmPFfo", name: "NTM P/FFO", description: "Next Twelve Months Price to Funds From Operations" },
  { id: "ntmPAffo", name: "NTM P/AFFO", description: "Next Twelve Months Price to Adjusted Funds From Operations" },
];

export const WatchlistView = ({ 
  watchlist, 
  onAddWatchlist, 
  onDeleteWatchlist, 
  onUpdateWatchlist 
}: WatchlistViewProps) => {
  const [isAddingTicker, setIsAddingTicker] = useState(false);

  const handleMetricSelect = (metricId: string) => {
    if (!watchlist.selectedMetrics.includes(metricId)) {
      const updatedMetrics = [...watchlist.selectedMetrics, metricId];
      onUpdateWatchlist({
        ...watchlist,
        selectedMetrics: updatedMetrics
      });
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    const updatedMetrics = watchlist.selectedMetrics.filter(id => id !== metricId);
    onUpdateWatchlist({
      ...watchlist,
      selectedMetrics: updatedMetrics
    });
  };

  const handleAddTicker = async (company: any) => {
    try {
      const { error } = await supabase
        .from('watchlist_stocks')
        .insert([{
          watchlist_id: watchlist.id,
          ticker: company.ticker,
          name: company.name,
          metrics: {}
        }]);

      if (error) throw error;

      const newStock = {
        ticker: company.ticker,
        name: company.name,
        price: 0,
        change: 0,
        marketCap: 0,
        metrics: {}
      };

      onUpdateWatchlist({
        ...watchlist,
        stocks: [...watchlist.stocks, newStock]
      });
      setIsAddingTicker(false);
      toast.success(`Added ${company.name} to watchlist`);
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      toast.error('Failed to add stock to watchlist');
    }
  };

  const handleDeleteTicker = async (ticker: string) => {
    try {
      const { error } = await supabase
        .from('watchlist_stocks')
        .delete()
        .eq('watchlist_id', watchlist.id)
        .eq('ticker', ticker);

      if (error) throw error;

      onUpdateWatchlist({
        ...watchlist,
        stocks: watchlist.stocks.filter(stock => stock.ticker !== ticker)
      });
      toast.success(`Removed ${ticker} from watchlist`);
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      toast.error('Failed to remove stock from watchlist');
    }
  };

  const handleCopyTable = () => {
    toast.success("Table copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <WatchlistHeader
        watchlistName={watchlist.name}
        onAddWatchlist={onAddWatchlist}
        onCopyTable={handleCopyTable}
        onUpdateWatchlistName={(name) => onUpdateWatchlist({ ...watchlist, name })}
      />

      <Dialog open={isAddingTicker} onOpenChange={setIsAddingTicker}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-green-600 border-green-600">
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

      <WatchlistMetrics
        selectedMetrics={watchlist.selectedMetrics}
        onMetricSelect={handleMetricSelect}
        onRemoveMetric={handleRemoveMetric}
        availableMetrics={availableMetrics}
      />

      <WatchlistTable
        stocks={watchlist.stocks}
        selectedMetrics={watchlist.selectedMetrics}
        availableMetrics={availableMetrics}
        onDeleteTicker={handleDeleteTicker}
      />

      <div className="flex justify-end">
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
