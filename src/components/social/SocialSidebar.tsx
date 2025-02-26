
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
    <div className="flex flex-col items-center py-4 h-full">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0"
          onClick={() => navigate('/feed')}
        >
          <span className="text-2xl font-bold text-blue-500">S</span>
        </Button>
      </div>
      
      <TooltipProvider>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(item.path)}
                  className="w-12 h-12 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <item.icon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>

      <div className="mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                onClick={() => navigate('/feed/create')}
              >
                <span className="text-white text-2xl">+</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Create Post</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {user && (
        <div className="mt-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-12 h-12 p-0 rounded-full"
                  onClick={() => navigate('/profile')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user.user_metadata?.full_name || 'Profile'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
