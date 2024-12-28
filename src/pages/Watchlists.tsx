import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

const Watchlists = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <h1 className="text-2xl font-bold">Watchlists</h1>
          {/* Add your watchlist content here */}
        </main>
      </div>
    </div>
  );
};

export default Watchlists;
