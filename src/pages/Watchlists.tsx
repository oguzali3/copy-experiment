import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { WatchlistContent } from "@/components/watchlist/WatchlistContent";

const Watchlists = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <WatchlistContent />
        </main>
      </div>
    </div>
  );
};

export default Watchlists;