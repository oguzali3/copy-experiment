import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleStockSelect = (stock: any) => {
    navigate(`/analysis?ticker=${stock.ticker}`);
  };

  return (
    <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
      <SearchBar onStockSelect={handleStockSelect} />
      <div className="flex items-center gap-2 ml-auto">
        <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
          Upgrade
        </Button>
        <ProfileMenu />
      </div>
    </div>
  );
};