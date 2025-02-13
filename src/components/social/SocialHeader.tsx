
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SocialHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-gray-200 bg-white dark:bg-gray-900 fixed top-0 left-0 right-0 z-50">
      <div className="h-full flex items-center px-6 justify-between">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5" />
          <span className="font-semibold">StockStream</span>
        </Button>
        <div className="flex items-center gap-3">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Upgrade
          </Button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};
