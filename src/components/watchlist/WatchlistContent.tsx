import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WatchlistEmpty } from "./WatchlistEmpty";
import { WatchlistCreate } from "./WatchlistCreate";
import { WatchlistView } from "./WatchlistView";

export type Stock = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  metrics: {
    [key: string]: string | number;
  };
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  evEbitda?: number;
  roe?: number;
  roa?: number;
  currentRatio?: number;
  quickRatio?: number;
  debtEquity?: number;
};

export type Watchlist = {
  id: string;
  name: string;
  stocks: Stock[];
  selectedMetrics: string[];
};

export const WatchlistContent = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWatchlist = (name: string) => {
    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name,
      stocks: [],
      selectedMetrics: []
    };
    setWatchlists([...watchlists, newWatchlist]);
    setSelectedWatchlist(newWatchlist);
    setIsCreating(false);
  };

  const handleDeleteWatchlist = (id: string) => {
    setWatchlists(watchlists.filter(w => w.id !== id));
    if (selectedWatchlist?.id === id) {
      setSelectedWatchlist(null);
    }
  };

  const handleUpdateWatchlist = (updatedWatchlist: Watchlist) => {
    setWatchlists(watchlists.map(w => 
      w.id === updatedWatchlist.id ? updatedWatchlist : w
    ));
    setSelectedWatchlist(updatedWatchlist);
  };

  if (watchlists.length === 0 && !isCreating) {
    return (
      <WatchlistEmpty onCreateClick={() => setIsCreating(true)} />
    );
  }

  if (isCreating) {
    return (
      <WatchlistCreate 
        onSubmit={handleCreateWatchlist}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {watchlists.map((watchlist) => (
          <Button
            key={watchlist.id}
            variant={selectedWatchlist?.id === watchlist.id ? "default" : "ghost"}
            onClick={() => setSelectedWatchlist(watchlist)}
            className={selectedWatchlist?.id === watchlist.id ? "bg-[#f5a623] hover:bg-[#f5a623]/90 text-white" : ""}
          >
            {watchlist.name}
          </Button>
        ))}
      </div>

      {selectedWatchlist && (
        <WatchlistView
          watchlist={selectedWatchlist}
          onAddWatchlist={() => setIsCreating(true)}
          onDeleteWatchlist={handleDeleteWatchlist}
          onUpdateWatchlist={handleUpdateWatchlist}
        />
      )}
    </div>
  );
};