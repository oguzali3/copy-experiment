import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { CompanyHeader } from "@/components/analysis/CompanyHeader";
import { NavigationTabs } from "@/components/analysis/NavigationTabs";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { AnalysisContent } from "@/components/analysis/AnalysisContent";

// Company data mapping (in a real app, this would come from an API)
const companyDataMap: Record<string, any> = {
  AAPL: {
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
  },
  MSFT: {
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: "420.55",
    change: "+2.80",
    changePercent: "+0.67",
    marketCap: "3.12T",
    summary: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.",
    ceo: "Satya Nadella",
    website: "www.microsoft.com",
    founded: "1975",
    ratios: {
      peRatio: "32.4x",
      pbRatio: "12.8x",
      debtToEquity: "0.35",
      currentRatio: "1.66",
      quickRatio: "1.64",
      returnOnEquity: "38.82%"
    }
  },
  // Add more companies as needed
};

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const urlTicker = searchParams.get("ticker");
  const [selectedStock, setSelectedStock] = useState(companyDataMap[urlTicker || "AAPL"]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (urlTicker && companyDataMap[urlTicker]) {
      setSelectedStock(companyDataMap[urlTicker]);
    }
  }, [urlTicker]);

  const handleStockSelect = (stock: any) => {
    setSelectedStock({
      ...stock,
      ceo: stock.ceo || "N/A",
      website: `www.${stock.ticker.toLowerCase()}.com`,
      founded: stock.founded || "N/A",
      ratios: stock.ratios || {
        peRatio: "N/A",
        pbRatio: "N/A",
        debtToEquity: "N/A",
        currentRatio: "N/A",
        quickRatio: "N/A",
        returnOnEquity: "N/A"
      }
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnalysisHeader />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
          <CompanyHeader {...selectedStock} />
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <AnalysisContent 
            activeTab={activeTab} 
            selectedStock={selectedStock} 
            onTabChange={setActiveTab}
          />
        </main>
      </div>
    </div>
  );
};

export default Analysis;
