
import { Button } from "@/components/ui/button";
import { UserCircle, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ProfileMenu = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        console.error("Error:", error.message);
      } else {
        toast.success("Signed out successfully");
        navigate('/');
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:bg-[#eef1f5] hover:text-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1"
        >
          <UserCircle className="h-9 w-9" />
          <span className="text-xs text-gray-600">Profile</span>
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
  );
};
