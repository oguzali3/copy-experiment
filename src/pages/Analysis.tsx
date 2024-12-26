import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StockChart } from "@/components/StockChart";
import { Card } from "@/components/ui/card";
import { CompanySearch } from "@/components/CompanySearch";
import { useState } from "react";
import { CompanyNewsList } from "@/components/CompanyNewsList";
import { NewsItem } from "@/types/news";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CompanyOverview } from "@/components/CompanyOverview";
import { AnalysisHeader } from "@/components/AnalysisHeader";
import { AnalysisNavigation } from "@/components/AnalysisNavigation";

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

  const newsData: NewsItem[] = [
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnalysisHeader />

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

            <AnalysisNavigation />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompanyOverview companyData={companyData} />

              <Card className="shadow-sm">
                <div className="p-4 border-b">
                  <CompanySearch onCompanySelect={handleCompanySelect} />
                </div>
                <StockChart />
              </Card>
            </div>

            <CompanyNewsList newsData={newsData} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Analysis;