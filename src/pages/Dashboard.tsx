import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MarketIndices } from "@/components/MarketIndices";
import { TopCompanies } from "@/components/TopCompanies";
import { SearchBar } from "@/components/SearchBar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-[#221F26] h-16 flex items-center px-6">
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