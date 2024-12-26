import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StockChart } from "@/components/StockChart";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle, LayoutGrid, Newspaper, ChartBar, DollarSign, LineChart, MessageSquare, FileText, Briefcase } from "lucide-react";
import { CompanySearch } from "@/components/CompanySearch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const defaultCompanyData = {
    name: "Apple Inc.",
    ticker: "AAPL",
    price: 182.52,
    change: +1.25,
    changePercent: +0.69,
    summary: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and Wearables, Home and Accessories.",
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
  };

  const [companyData, setCompanyData] = useState(defaultCompanyData);

  const newsData = [
    {
      id: 1,
      title: `${companyData.name} Reports Strong Q4 Earnings, Beats Market Expectations`,
      date: "2024-03-15",
      source: "Financial Times",
      summary: `${companyData.name} reported quarterly earnings that exceeded analyst expectations, driven by strong product sales and market expansion. The company's revenue grew by 15% year-over-year.`,
      url: "#"
    },
    {
      id: 2,
      title: `${companyData.name} Announces New Strategic Partnership`,
      date: "2024-03-14",
      source: "Reuters",
      summary: "The company has entered into a strategic partnership to enhance its market presence and develop new technologies.",
      url: "#"
    },
    {
      id: 3,
      title: `${companyData.name} Expands Operations in Asian Markets`,
      date: "2024-03-13",
      source: "Bloomberg",
      summary: "The expansion plan includes opening new facilities and increasing workforce in key Asian markets.",
      url: "#"
    }
  ];

  const handleCompanySelect = (selectedCompany: any) => {
    const newCompanyData = {
      name: selectedCompany.name,
      ticker: selectedCompany.ticker,
      price: parseFloat(selectedCompany.price),
      change: parseFloat(selectedCompany.change),
      changePercent: parseFloat(selectedCompany.change),
      summary: "This company is a leading player in its industry, focusing on innovation and sustainable growth.",
      ceo: "John Doe",
      website: `www.${selectedCompany.ticker.toLowerCase()}.com`,
      founded: "2000",
      ratios: {
        peRatio: "25.4x",
        pbRatio: "3.2x",
        debtToEquity: "0.85",
        currentRatio: "1.2",
        quickRatio: "0.95",
        returnOnEquity: "18.5%"
      }
    };

    setCompanyData(newCompanyData);
  };

  const navItems = [
    { icon: LayoutGrid, label: "Overview", isActive: true },
    { icon: Newspaper, label: "News", path: `/company/${companyData.ticker}/news` },
    { icon: ChartBar, label: "Financials" },
    { icon: DollarSign, label: "Valuation" },
    { icon: LineChart, label: "Estimates" },
    { icon: MessageSquare, label: "Transcripts" },
    { icon: FileText, label: "Filings" },
    { icon: Briefcase, label: "Ownership" },
  ];

  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
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

        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
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

          {/* Navigation Buttons with ScrollArea */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Company Overview</h2>
              <div className="space-y-4">
                <p className="text-gray-600">{companyData.summary}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <h3 className="font-medium text-gray-900">CEO</h3>
                    <p className="text-gray-600">{companyData.ceo}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Founded</h3>
                    <p className="text-gray-600">{companyData.founded}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Website</h3>
                    <a href={`https://${companyData.website}`} className="text-[#077dfa] hover:underline" target="_blank" rel="noopener noreferrer">
                      {companyData.website}
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Key Financial Ratios</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">P/E Ratio</p>
                      <p className="font-medium text-gray-900">{companyData.ratios.peRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">P/B Ratio</p>
                      <p className="font-medium text-gray-900">{companyData.ratios.pbRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Debt/Equity</p>
                      <p className="font-medium text-gray-900">{companyData.ratios.debtToEquity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Ratio</p>
                      <p className="font-medium text-gray-900">{companyData.ratios.currentRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quick Ratio</p>
                      <p className="font-medium text-gray-900">{companyData.ratios.quickRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ROE</p>
                      <p className="font-medium text-gray-900">{companyData.ratios.returnOnEquity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <div className="p-4 border-b">
                <CompanySearch onCompanySelect={handleCompanySelect} />
              </div>
              <StockChart />
            </Card>
          </div>

          {/* News Section */}
          <Card className="p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent News</h2>
              <Button 
                variant="ghost" 
                className="text-[#077dfa]"
                onClick={() => navigate(`/company/${companyData.ticker}/news`)}
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
