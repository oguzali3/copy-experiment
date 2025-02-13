
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SocialHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200">
      <div className="px-4 h-14 flex items-center">
        <h1 className="text-xl font-semibold">Home</h1>
      </div>
    </div>
  );
};
