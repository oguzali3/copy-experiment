
import { Home, Search, Bell, Mail, UserCircle, PenSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  return <div className="fixed h-screen pt-2 w-[275px]">
      <div className="px-4 mb-2">
        <Button variant="ghost" className="text-xl font-semibold px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800" onClick={() => navigate('/')}>
          StockStream
        </Button>
      </div>
      <nav className="space-y-1 px-2">
        {menuItems.map(item => <Button key={item.title} variant="ghost" onClick={() => navigate(item.path)} className="w-[250px] justify-start gap-4 px-4 text-xl hover:bg-gray-200 dark:hover:bg-gray-800 py-[1px] rounded-md">
            <item.icon className="h-6 w-6" />
            <span>{item.title}</span>
          </Button>)}
      </nav>
      <div className="px-4 mt-4">
        <Button className="w-[250px] bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 text-lg" onClick={() => navigate('/feed/create')}>
          Post
        </Button>
      </div>

      {user && <div className="absolute bottom-4 px-4">
          <Button variant="ghost" className="w-[250px] justify-start p-3 hover:bg-gray-200 dark:hover:bg-gray-800" onClick={() => navigate('/profile')}>
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
          </Button>
        </div>}
    </div>;
};
