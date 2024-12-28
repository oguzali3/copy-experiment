import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add any logout logic here (clearing tokens, etc)
    navigate('/');
  };

  return (
    <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
      <SearchBar onStockSelect={() => {}} />
      <div className="flex items-center gap-2 ml-auto">
        <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
          Upgrade
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1 [&_svg]:!text-white hover:[&_svg]:!text-white"
            >
              <UserCircle className="h-9 w-9" />
              <span className="text-xs text-white/80">Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};