
import { LayoutDashboard, LineChart, List, Settings, PieChart, Home, Filter, LogOut, UserRound, Users } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from '@supabase/auth-helpers-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  }, {
    title: "Analysis",
    icon: LineChart,
    path: "/analysis"
  }, {
    title: "Screening",
    icon: Filter,
    path: "/screening"
  }, {
    title: "Watchlists",
    icon: List,
    path: "/watchlists"
  }, {
    title: "Feed",
    icon: Users,
    path: "/feed"
  }, {
    title: "Profile",
    icon: UserRound,
    path: "/profile"
  }, {
    title: "Settings",
    icon: Settings,
    path: "/settings"
  }
];

export const DashboardSidebar = () => {
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [defaultPortfolioId, setDefaultPortfolioId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchDefaultPortfolio = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching default portfolio:', error);
          return;
        }
        
        if (data) {
          setDefaultPortfolioId(data.id);
        }
      } catch (error) {
        console.error('Error fetching default portfolio:', error);
      }
    };

    fetchDefaultPortfolio();
  }, [user]);

  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultPortfolioId) {
      navigate('/portfolio', {
        state: {
          portfolioId: defaultPortfolioId
        }
      });
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div 
      className={cn(
        "h-screen transition-all duration-300 ease-in-out border-r dark:bg-[#1c1c20] dark:border-gray-800",
        isHovered ? "w-64" : "w-20"
      )} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-4 border-b dark:border-gray-800">
        <div className={cn("overflow-hidden transition-all duration-300 flex items-center", isHovered ? "justify-start w-full" : "justify-center")}>
          <div className="flex-shrink-0 w-8 h-8 flex flex-row items-end justify-center space-x-1">
            <div className="bg-black dark:bg-white h-4 w-1.5 rounded-sm"></div>
            <div className="bg-black dark:bg-white h-6 w-1.5 rounded-sm"></div>
          </div>
          {isHovered && <span className="ml-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden transition-opacity duration-300 text-lg">Biggr</span>}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-6 space-y-8">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.title} 
              to={item.path} 
              className={cn(
                "flex flex-col items-center px-2 py-2 rounded-md text-xs font-medium transition-all",
                isActive 
                  ? "text-[#077dfa] dark:text-blue-400" 
                  : "text-gray-600 hover:text-[#077dfa] dark:text-gray-300 dark:hover:text-blue-400"
              )}
            >
              <div className={cn(
                "h-10 w-10 flex items-center justify-center rounded-md mb-1",
                isActive 
                  ? "bg-[#eef1f5] dark:bg-gray-800" 
                  : "hover:bg-[#eef1f5] dark:hover:bg-gray-800"
              )}>
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#077dfa] dark:text-blue-400" : "")} />
              </div>
              <span className="text-center whitespace-nowrap">
                {item.title}
              </span>
            </Link>
          );
        })}

        {/* Portfolio Menu Item */}
        <a 
          href="#" 
          onClick={handlePortfolioClick} 
          className={cn(
            "flex flex-col items-center px-2 py-2 rounded-md text-xs font-medium transition-all",
            location.pathname === '/portfolio' 
              ? "text-[#077dfa] dark:text-blue-400" 
              : "text-gray-600 hover:text-[#077dfa] dark:text-gray-300 dark:hover:text-blue-400"
          )}
        >
          <div className={cn(
            "h-10 w-10 flex items-center justify-center rounded-md mb-1",
            location.pathname === '/portfolio' 
              ? "bg-[#eef1f5] dark:bg-gray-800" 
              : "hover:bg-[#eef1f5] dark:hover:bg-gray-800"
          )}>
            <PieChart className={cn("h-5 w-5 flex-shrink-0", location.pathname === '/portfolio' ? "text-[#077dfa] dark:text-blue-400" : "")} />
          </div>
          <span className="text-center whitespace-nowrap">
            Portfolio
          </span>
        </a>
      </nav>

      {/* User Section */}
      <div className="p-3 mt-auto">
        <button 
          onClick={handleLogout} 
          className={cn(
            "flex flex-col items-center w-full px-2 py-2 text-xs font-medium rounded-md transition-all", 
            "text-gray-600 hover:text-[#077dfa] dark:text-gray-300 dark:hover:text-blue-400"
          )}
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-md mb-1 hover:bg-[#eef1f5] dark:hover:bg-gray-800">
            <LogOut className="h-5 w-5 flex-shrink-0" />
          </div>
          <span className="text-center whitespace-nowrap">
            Logout
          </span>
        </button>

        {user && (
          <div className={cn("flex flex-col items-center mt-3 py-2 px-2 rounded-md", isHovered ? "justify-start" : "justify-center")}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            {isHovered && <div className="mt-2 overflow-hidden">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-full text-center">
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>}
          </div>
        )}
      </div>
    </div>
  );
};
