
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const handleStockSelect = (stock: any) => {
    navigate(`/analysis?ticker=${stock.ticker}`);
  };
  
  return (
    <div className="h-16 flex items-center px-6 gap-4 flex-shrink-0 border-b bg-white dark:bg-[#1c1c20] dark:border-gray-800">
      <div className="w-full max-w-[600px]">
        <SearchBar onStockSelect={handleStockSelect} />
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <Button variant="ghost" className="text-gray-600 hover:bg-[#eef1f5] hover:text-[#077dfa] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400" onClick={() => navigate('/feed')}>
          <Users className="h-4 w-4 mr-2" />
          Community
        </Button>
        <Button className="text-white bg-[#27aa43] hover:bg-[#1f9936]">
          Upgrade
        </Button>
        <ProfileMenu />
      </div>
    </div>
  );
};
