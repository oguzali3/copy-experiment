// src/pages/Watchlists.tsx
import { WatchlistContent } from "@/components/watchlist/WatchlistContent";
import { WatchlistProvider } from "@/contexts/WatchlistContext";

const WatchlistsPage = () => {
  return (
    <WatchlistProvider>
      <WatchlistContent />
    </WatchlistProvider>
  );
};

export default WatchlistsPage;