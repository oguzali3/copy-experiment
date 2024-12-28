import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { WatchlistContent } from "@/components/watchlist/WatchlistContent";

const Watchlists = () => {
  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <AnalysisHeader />
        <main className="flex-1 p-6 overflow-auto">
          <WatchlistContent />
        </main>
      </div>
    </div>
  );
};

export default Watchlists;