
import { MarketIndices } from "@/components/MarketIndices";
import { TopCompanies } from "@/components/TopCompanies";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  return (
    <div className="space-y-6 dark:bg-[#1c1c20]">
      <MarketIndices />
      <Separator className="my-6 dark:bg-gray-800" />
      <TopCompanies />
    </div>
  );
};

export default Dashboard;
