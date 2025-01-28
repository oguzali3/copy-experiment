import { 
  BarChart3, 
  LineChart, 
  List, 
  Settings, 
  PieChart, 
  Home,
  Filter,
  Building
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Analysis", icon: BarChart3, path: "/analysis" },
  { title: "Charting", icon: LineChart, path: "/charting" },
  { title: "Screening", icon: Filter, path: "/screening" },
  { title: "Watchlists", icon: List, path: "/watchlists" },
  { title: "Portfolio", icon: PieChart, path: "/portfolio" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export const DashboardSidebar = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar 
      className="bg-[#191d25] border-r-0 transition-all duration-300 dark:bg-[#1c1c20]" 
      collapsible="icon"
    >
      <div 
        className="p-4 flex items-center cursor-pointer" 
        onClick={toggleSidebar}
      >
        <Building className="h-8 w-8 text-white shrink-0" />
        <span className={`ml-2 text-lg font-semibold text-white transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
          TradePro
        </span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`text-white/70 transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                    tooltip={state === 'collapsed' ? item.title : undefined}
                    asChild
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span className={`transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};