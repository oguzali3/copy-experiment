import { useState } from "react";
import { WatchlistEmpty } from "./WatchlistEmpty";
import { WatchlistCreate } from "./WatchlistCreate";
import { WatchlistView } from "./WatchlistView";
import { Button } from "@/components/ui/button";

export type Stock = {
  ticker: string;
  name: string;
  metrics: {
    [key: string]: string | number;
  };
};

export type Watchlist = {
  id: string;
  name: string;
  stocks: Stock[];
  selectedMetrics: string[];
};

// Mock data
const mockStocks: Stock[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    metrics: {
      ntmPE: "34.57",
      ntmTevEbit: "28.90",
      ntmMcFcf: "25.6",
      ntmPCfps: "30.2",
    }
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    metrics: {
      ntmPE: "32.66",
      ntmTevEbit: "25.53",
      ntmMcFcf: "22.4",
      ntmPCfps: "28.1",
    }
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    metrics: {
      ntmPE: "34.74",
      ntmTevEbit: "29.29",
      ntmMcFcf: "27.8",
      ntmPCfps: "31.5",
    }
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    metrics: {
      ntmPE: "-",
      ntmTevEbit: "-",
      ntmMcFcf: "-",
      ntmPCfps: "-",
    }
  }
];

export const WatchlistContent = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWatchlist = (name: string) => {
    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name,
      stocks: mockStocks,
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
        />
      )}
    </div>
  );
};