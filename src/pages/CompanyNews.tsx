import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle, LayoutGrid, Newspaper, ChartBar, DollarSign, LineChart, MessageSquare, FileText, Briefcase } from "lucide-react";
import { CompanyNewsContent } from "@/components/CompanyNewsContent";
import { CompanyEventsContent } from "@/components/CompanyEventsContent";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CompanyNews = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();

  // Mock company data - in a real app, this would come from an API or state management
  const companyData = {
    name: "Apple Inc.",
    ticker: "AAPL",
    price: 182.52,
    change: +1.25,
    changePercent: +0.69,
  };

  const navItems = [
    { icon: LayoutGrid, label: "Overview", path: "/analysis" },
    { icon: Newspaper, label: "News", path: `/company/${ticker}/news`, isActive: true },
    { icon: ChartBar, label: "Financials", path: "#" },
    { icon: DollarSign, label: "Valuation", path: "#" },
    { icon: LineChart, label: "Estimates", path: "#" },
    { icon: MessageSquare, label: "Transcripts", path: "#" },
    { icon: FileText, label: "Filings", path: "#" },
    { icon: Briefcase, label: "Ownership", path: "#" },
  ];

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4">
          <SearchBar />
          <div className="flex items-center gap-2 ml-auto">
            <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
              Upgrade
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1 [&_svg]:!text-white hover:[&_svg]:!text-white"
            >
              <UserCircle className="h-9 w-9" />
              <span className="text-xs text-white/80">Profile</span>
            </Button>
          </div>
        </div>

        <main className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyData.name}</h1>
              <span className="text-gray-500">${companyData.ticker}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${companyData.price.toFixed(2)}</div>
              <div className={`flex items-center justify-end ${companyData.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>{companyData.change > 0 ? '+' : ''}{companyData.change.toFixed(2)} ({companyData.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          <ScrollArea className="w-full whitespace-nowrap border-b">
            <div className="flex w-max min-w-full">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => item.path !== "#" && navigate(item.path)}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyNewsContent ticker={ticker} />
            <CompanyEventsContent ticker={ticker} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyNews;