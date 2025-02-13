
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  UserCircle, 
  PenSquare,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Home", icon: Home, path: "/feed" },
  { title: "Explore", icon: Search, path: "/feed/explore" },
  { title: "Notifications", icon: Bell, path: "/feed/notifications" },
  { title: "Messages", icon: Mail, path: "/feed/messages" },
  { title: "Profile", icon: UserCircle, path: "/profile" },
];

export const SocialSidebar = () => {
  const navigate = useNavigate();
  const user = useUser();

  return (
    <Sidebar className="fixed top-16 h-[calc(100vh-64px)] border-r border-gray-200 bg-white dark:bg-gray-900 w-72">
      <SidebarContent className="h-full flex flex-col">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-lg">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Button 
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6"
                  onClick={() => navigate('/feed/create')}
                >
                  <PenSquare className="h-5 w-5 mr-2" />
                  Post
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile Overview */}
        {user && (
          <div className="mt-auto p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  @{user.user_metadata?.username || user.email?.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
