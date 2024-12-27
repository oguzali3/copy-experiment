import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StockChart } from "@/components/StockChart";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { CompanyNewsContent } from "@/components/CompanyNewsContent";
import { CompanyEventsContent } from "@/components/CompanyEventsContent";
import { FinancialStatements } from "@/components/FinancialStatements";
import { CompanyHeader } from "@/components/analysis/CompanyHeader";
import { CompanyOverview } from "@/components/analysis/CompanyOverview";
import { NavigationTabs } from "@/components/analysis/NavigationTabs";
import { EstimatesChart } from "@/components/valuation/EstimatesChart";
import { ValuationMetrics } from "@/components/valuation/ValuationMetrics";
import { TranscriptsContent } from "@/components/analysis/TranscriptsContent";
import { FilingsContent } from "@/components/analysis/FilingsContent";

// Default stock data moved to a constant
const defaultStock = {
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
};

const Analysis = () => {
  const [selectedStock, setSelectedStock] = useState(defaultStock);
  const [activeTab, setActiveTab] = useState("overview");

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

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompanyOverview {...selectedStock} />
              <div className="h-[500px]">
                <StockChart ticker={selectedStock.ticker} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Latest News</h2>
                <Button 
                  variant="outline" 
                  className="text-[#077dfa] hover:text-[#077dfa] hover:bg-blue-50"
                  onClick={() => setActiveTab("news")}
                >
                  View All News →
                </Button>
              </div>
              <CompanyNewsContent ticker={selectedStock.ticker} limit={5} />
            </div>
          </div>
        );
      case "news":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyNewsContent ticker={selectedStock.ticker} />
            <CompanyEventsContent ticker={selectedStock.ticker} />
          </div>
        );
      case "financials":
        return (
          <div className="space-y-6">
            <FinancialStatements ticker={selectedStock.ticker} />
          </div>
        );
      case "estimates":
        return (
          <div className="space-y-6">
            <EstimatesChart ticker={selectedStock.ticker} />
          </div>
        );
      case "valuation":
        return (
          <div className="space-y-6">
            <ValuationMetrics />
          </div>
        );
      case "transcripts":
        return (
          <div className="space-y-6">
            <TranscriptsContent ticker={selectedStock.ticker} />
          </div>
        );
      case "filings":
        return (
          <div className="space-y-6">
            <FilingsContent ticker={selectedStock.ticker} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-gray-500">Content for {activeTab} is coming soon...</p>
          </div>
        );
    }
  };

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
          <CompanyHeader {...selectedStock} />
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Analysis;
