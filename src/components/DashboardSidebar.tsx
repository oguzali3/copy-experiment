import { BarChart3, LineChart, List, Settings, PieChart, Home, Filter, Building, UserRound, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from '@supabase/auth-helpers-react';
const menuItems = [{
  title: "Dashboard",
  icon: Home,
  path: "/dashboard"
}, {
  title: "Analysis",
  icon: BarChart3,
  path: "/analysis"
}, {
  title: "Charting",
  icon: LineChart,
  path: "/charting"
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
},
// Portfolio is handled separately now
{
  title: "Profile",
  icon: UserRound,
  path: "/profile"
}, {
  title: "Settings",
  icon: Settings,
  path: "/settings"
}];
export const DashboardSidebar = () => {
  const {
    toggleSidebar,
    state
  } = useSidebar();
  const user = useUser();
  const navigate = useNavigate();
  const [defaultPortfolioId, setDefaultPortfolioId] = useState<string | null>(null);
  useEffect(() => {
    const fetchDefaultPortfolio = async () => {
      if (!user) return;
      try {
        const {
          data,
          error
        } = await supabase.from('portfolios').select('id').eq('user_id', user.id).limit(1).maybeSingle();
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
  return <Sidebar className="bg-[#191d25] border-r-0 transition-all duration-300 dark:bg-[#1c1c20]" collapsible="icon">
      <div onClick={toggleSidebar} className="p-4 flex items-center cursor-pointer bg-zinc-500">
        <Building className="h-8 w-8 text-white shrink-0" />
        <span className={`ml-2 text-lg font-semibold text-white transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
          TradePro
        </span>
      </div>
      <SidebarContent className="bg-[#f9f8f6]">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-white/70 transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300" tooltip={state === 'collapsed' ? item.title : undefined} asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span className={`transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
              {/* Portfolio menu item */}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300" tooltip={state === 'collapsed' ? "Portfolio" : undefined} asChild>
                  <a href="#" onClick={handlePortfolioClick}>
                    <PieChart className="h-4 w-4" />
                    <span className={`transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
                      Portfolio
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
};