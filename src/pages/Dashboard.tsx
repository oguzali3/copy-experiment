import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MarketIndices } from "@/components/MarketIndices";
import { TopCompanies } from "@/components/TopCompanies";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4">
          <SearchBar />
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white"
            >
              Upgrade
            </Button>
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-[#077dfa] w-12 h-12 [&_svg]:!text-white hover:[&_svg]:!text-white"
              >
                <UserCircle className="h-9 w-9" />
              </Button>
              <span className="text-xs text-white/80 -mt-1">Profile</span>
            </div>
          </div>
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