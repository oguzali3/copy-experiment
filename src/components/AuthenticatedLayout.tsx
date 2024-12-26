import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { UserCircle } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
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
        <main className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};