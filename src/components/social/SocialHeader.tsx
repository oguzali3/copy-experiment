
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { Home } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SocialSearch } from "./SocialSearch";

export const SocialHeader = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/feed':
        return 'Home';
      case '/profile':
        return 'Profile';
      case '/messages':
        return 'Messages';
      default:
        return 'Home';
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200">
      <div className="px-4 h-14 flex items-center gap-4">
        <h1 className="text-xl font-semibold min-w-[100px]">{getPageTitle()}</h1>
        <SocialSearch />
      </div>
    </div>
  );
};
