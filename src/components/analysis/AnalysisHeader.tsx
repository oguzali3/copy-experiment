import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/ProfileMenu";

export const AnalysisHeader = () => {
  return (
    <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
      <SearchBar onStockSelect={() => {}} />
      <div className="flex items-center gap-2 ml-auto">
        <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
          Upgrade
        </Button>
        <ProfileMenu />
      </div>
    </div>
  );
};