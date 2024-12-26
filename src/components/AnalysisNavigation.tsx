import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid, Newspaper, ChartBar, DollarSign, LineChart, MessageSquare, FileText, Briefcase } from "lucide-react";

export const navItems = [
  { icon: LayoutGrid, label: "Overview", isActive: true },
  { icon: Newspaper, label: "News" },
  { icon: ChartBar, label: "Financials" },
  { icon: DollarSign, label: "Valuation" },
  { icon: LineChart, label: "Estimates" },
  { icon: MessageSquare, label: "Transcripts" },
  { icon: FileText, label: "Filings" },
  { icon: Briefcase, label: "Ownership" },
];

export const AnalysisNavigation = () => {
  return (
    <ScrollArea className="w-full whitespace-nowrap border-b">
      <div className="flex w-max min-w-full">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`flex items-center gap-2 px-4 py-2 rounded-none border-b-2 transition-colors ${
              item.isActive 
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