
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
    <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="w-[400px]">
        <SearchBar onStockSelect={handleStockSelect} />
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => navigate('/feed')}
        >
          <Users className="h-4 w-4 mr-2" />
          Community
        </Button>
        <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
          Upgrade
        </Button>
        <ProfileMenu />
      </div>
    </div>
  );
};
