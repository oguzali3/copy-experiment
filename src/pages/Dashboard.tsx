import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MarketIndices } from "@/components/MarketIndices";
import { TopCompanies } from "@/components/TopCompanies";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ArrowUp, UserRound } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-black h-16 flex items-center px-6 gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowUp className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <UserRound className="h-5 w-5" />
            </Button>
          </div>
          <SearchBar />
        </div>
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <MarketIndices />
          <TopCompanies />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;