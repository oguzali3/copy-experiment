import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export const AnalysisHeader = () => {
  return (
    <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
      <SearchBar onStockSelect={() => {}} />
      <div className="flex items-center gap-2 ml-auto">
        <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
          Upgrade
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1 [&_svg]:!text-white hover:[&_svg]:!text-white"
        >
          <UserCircle className="h-9 w-9" />
          <span className="text-xs text-white/80">Profile</span>
        </Button>
      </div>
    </div>
  );
};