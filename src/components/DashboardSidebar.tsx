import { 
  BarChart3, 
  LineChart, 
  List, 
  Settings, 
  BookOpen, 
  Home,
  Search,
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

const menuItems = [
  { title: "Dashboard", icon: Home },
  { title: "Charting", icon: LineChart },
  { title: "Screening", icon: Search },
  { title: "Watchlists", icon: List },
  { title: "Market Analysis", icon: BarChart3 },
  { title: "Resources", icon: BookOpen },
  { title: "Settings", icon: Settings },
];

export const DashboardSidebar = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar 
      className="bg-[#403E43] border-r-0 transition-all duration-300" 
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
                  >
                    <item.icon className="h-4 w-4" />
                    <span className={`transition-opacity duration-300 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
                      {item.title}
                    </span>
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