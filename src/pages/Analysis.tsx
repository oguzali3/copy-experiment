import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StockChart } from "@/components/StockChart";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle, LayoutGrid, Newspaper, ChartBar, DollarSign, LineChart, MessageSquare, FileText, Briefcase } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState({
    name: "Apple Inc.",
    ticker: "AAPL",
    price: "182.52",
    change: "+1.25",
    changePercent: "+0.69",
    marketCap: "2.85T",
    summary: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
    ceo: "Tim Cook",
    website: "www.apple.com",
    founded: "1976",
    ratios: {
      peRatio: "28.5x",
      pbRatio: "44.6x",
      debtToEquity: "1.76",
      currentRatio: "0.98",
      quickRatio: "0.92",
      returnOnEquity: "145.81%"
    }
  });

  const handleStockSelect = (stock: any) => {
    // Update the selected stock with additional data
    setSelectedStock({
      ...stock,
      ceo: "John Doe", // Placeholder data
      website: `www.${stock.ticker.toLowerCase()}.com`,
      founded: "2000",
      ratios: {
        peRatio: "25.4x",
        pbRatio: "3.2x",
        debtToEquity: "0.85",
        currentRatio: "1.2",
        quickRatio: "0.95",
        returnOnEquity: "18.5%"
      }
    });
  };

  const newsData = [
    {
      id: 1,
      title: `${selectedStock.name} Reports Strong Q4 Earnings`,
      date: "2024-03-15",
      source: "Financial Times",
      summary: `${selectedStock.name} reported quarterly earnings that exceeded analyst expectations, driven by strong product sales and market expansion.`,
      url: "#"
    },
    {
      id: 2,
      title: `${selectedStock.name} Announces New Strategic Partnership`,
      date: "2024-03-14",
      source: "Reuters",
      summary: "The company has entered into a strategic partnership to enhance its market presence and develop new technologies.",
      url: "#"
    },
    {
      id: 3,
      title: `${selectedStock.name} Expands Operations in Asian Markets`,
      date: "2024-03-13",
      source: "Bloomberg",
      summary: "The expansion plan includes opening new facilities and increasing workforce in key Asian markets.",
      url: "#"
    }
  ];

  const navItems = [
    { icon: LayoutGrid, label: "Overview", isActive: true },
    { icon: Newspaper, label: "News", path: `/company/${selectedStock.ticker}/news` },
    { icon: ChartBar, label: "Financials" },
    { icon: DollarSign, label: "Valuation" },
    { icon: LineChart, label: "Estimates" },
    { icon: MessageSquare, label: "Transcripts" },
    { icon: FileText, label: "Filings" },
    { icon: Briefcase, label: "Ownership" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
          <SearchBar onStockSelect={handleStockSelect} />
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

        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedStock.name}</h1>
              <span className="text-gray-500">${selectedStock.ticker}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${selectedStock.price}</div>
              <div className={`flex items-center justify-end ${parseFloat(selectedStock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>{selectedStock.change} ({selectedStock.changePercent})</span>
              </div>
            </div>
          </div>

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
                  onClick={() => item.path && navigate(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 h-[850px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Company Overview</h2>
              <div className="space-y-4">
                <p className="text-gray-600">{selectedStock.summary}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">CEO</p>
                    <p className="font-medium">{selectedStock.ceo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Founded</p>
                    <p className="font-medium">{selectedStock.founded}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-medium text-blue-600">{selectedStock.website}</p>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Key Ratios</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">P/E Ratio</p>
                      <p className="font-medium">{selectedStock.ratios.peRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">P/B Ratio</p>
                      <p className="font-medium">{selectedStock.ratios.pbRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Debt/Equity</p>
                      <p className="font-medium">{selectedStock.ratios.debtToEquity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Ratio</p>
                      <p className="font-medium">{selectedStock.ratios.currentRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quick Ratio</p>
                      <p className="font-medium">{selectedStock.ratios.quickRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ROE</p>
                      <p className="font-medium">{selectedStock.ratios.returnOnEquity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="space-y-6">
              <div className="h-[850px]">
                <StockChart />
              </div>
            </div>
          </div>

          <Card className="p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent News</h2>
              <Button 
                variant="ghost" 
                className="text-[#077dfa]"
                onClick={() => navigate(`/company/${selectedStock.ticker}/news`)}
              >
                View All
              </Button>
            </div>
            <div className="space-y-6">
              {newsData.map((news) => (
                <div key={news.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-[#077dfa] cursor-pointer">
                      {news.title}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{news.date}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{news.summary}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500">Source: {news.source}</span>
                    <Button variant="link" className="text-[#077dfa] p-0 h-auto ml-4">
                      Read More →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Analysis;