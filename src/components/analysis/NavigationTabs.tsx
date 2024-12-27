import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid, Newspaper, ChartBar, LineChart, MessageSquare, FileText, Briefcase } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  const navItems = [
    { icon: LayoutGrid, label: "Overview", id: "overview" },
    { icon: Newspaper, label: "News", id: "news" },
    { icon: ChartBar, label: "Financials", id: "financials" },
    { icon: LineChart, label: "Estimates", id: "estimates" },
    { icon: MessageSquare, label: "Transcripts", id: "transcripts" },
    { icon: FileText, label: "Filings", id: "filings" },
    { icon: Briefcase, label: "Ownership", id: "ownership" },
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap border-b">
      <div className="flex w-max min-w-full">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-none border-b-2 transition-colors ${
              activeTab === item.id
                ? 'border-[#077dfa] text-[#077dfa] bg-blue-50/50' 
                : 'border-transparent hover:border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};