
import { Home, Search, Bell, Mail, UserCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [{
  title: "Home",
  icon: Home,
  path: "/feed"
}, {
  title: "Explore",
  icon: Search,
  path: "/feed/explore"
}, {
  title: "Notifications",
  icon: Bell,
  path: "/feed/notifications"
}, {
  title: "Messages",
  icon: Mail,
  path: "/feed/messages"
}, {
  title: "Profile",
  icon: UserCircle,
  path: "/profile"
}];

export const SocialSidebar = () => {
  const navigate = useNavigate();
  const user = useUser();

  return (
    <div className="flex flex-col items-center py-4 h-full border-r dark:bg-[#1c1c20] dark:border-gray-800">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 flex flex-col items-center"
          onClick={() => navigate('/feed')}
        >
          <span className="text-2xl font-bold text-blue-500">S</span>
          <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Social</span>
        </Button>
      </div>
      
      <nav className="space-y-8">
        {menuItems.map(item => (
          <div key={item.title} className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(item.path)}
              className="w-12 h-12 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-gray-300 mb-1"
            >
              <item.icon className="h-5 w-5" />
            </Button>
            <span className="text-xs text-gray-600 dark:text-gray-300">{item.title}</span>
          </div>
        ))}
      </nav>

      <div className="mt-8">
        <div className="flex flex-col items-center">
          <Button
            className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 p-0 mb-1"
            onClick={() => navigate('/feed/create')}
          >
            <span className="text-white text-xl">+</span>
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">Post</span>
        </div>
      </div>

      {user && (
        <div className="mt-auto flex flex-col items-center">
          <Button 
            variant="ghost" 
            className="w-12 h-12 p-0 rounded-full mb-1"
            onClick={() => navigate('/profile')}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="dark:bg-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {user.user_metadata?.full_name?.split(' ')[0] || 'Me'}
          </span>
        </div>
      )}
    </div>
  );
};
