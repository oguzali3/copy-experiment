import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { CompanyHeader } from "@/components/analysis/CompanyHeader";
import { NavigationTabs } from "@/components/analysis/NavigationTabs";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { AnalysisContent } from "@/components/analysis/AnalysisContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const urlTicker = searchParams.get("ticker") || "AAPL";
  const [activeTab, setActiveTab] = useState("overview");

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company-profile', urlTicker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'profile', symbol: urlTicker }
      });

      if (error) throw error;
      return data[0];
    },
    enabled: !!urlTicker
  });

  const { data: quoteData } = useQuery({
    queryKey: ['company-quote', urlTicker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'quote', symbol: urlTicker }
      });

      if (error) throw error;
      return data[0];
    },
    enabled: !!urlTicker
  });

  const selectedStock = {
    name: companyData?.companyName || "Loading...",
    ticker: urlTicker,
    price: quoteData?.price?.toFixed(2) || "0.00",
    change: quoteData?.change?.toFixed(2) || "0.00",
    changePercent: quoteData?.changesPercentage?.toFixed(2) || "0.00",
    marketCap: quoteData?.marketCap || "N/A",
    summary: companyData?.description || "Loading company description...",
    ceo: companyData?.ceo || "N/A",
    website: companyData?.website || `www.${urlTicker.toLowerCase()}.com`,
    founded: companyData?.ipoDate || "N/A",
    ratios: {
      peRatio: quoteData?.pe?.toFixed(2) + "x" || "N/A",
      pbRatio: quoteData?.priceToBook?.toFixed(2) + "x" || "N/A",
      debtToEquity: (quoteData?.debtToEquity || 0).toFixed(2),
      currentRatio: "N/A",
      quickRatio: "N/A",
      returnOnEquity: (quoteData?.returnOnEquity || 0).toFixed(2) + "%"
    }
  };

  const handleStockSelect = (stock: any) => {
    window.location.href = `/analysis?ticker=${stock.ticker}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
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