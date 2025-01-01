import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CompanyHeader } from "@/components/analysis/CompanyHeader";
import { NavigationTabs } from "@/components/analysis/NavigationTabs";
import { AnalysisContent } from "@/components/analysis/AnalysisContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Analysis = () => {
  console.log('Analysis component rendering'); // Debug log
  
  const [searchParams] = useSearchParams();
  const urlTicker = searchParams.get("ticker") || "AAPL";
  const [activeTab, setActiveTab] = useState("overview");

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ['company-profile', urlTicker],
    queryFn: async () => {
      console.log('Fetching company profile for:', urlTicker); // Debug log
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'profile', symbol: urlTicker }
      });

      if (error) {
        console.error('Error fetching company profile:', error); // Debug log
        throw error;
      }
      console.log('Company profile data received:', data); // Debug log
      return data[0];
    },
    enabled: !!urlTicker
  });

  const { data: quoteData, error: quoteError } = useQuery({
    queryKey: ['company-quote', urlTicker],
    queryFn: async () => {
      console.log('Fetching company quote for:', urlTicker); // Debug log
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'quote', symbol: urlTicker }
      });

      if (error) {
        console.error('Error fetching company quote:', error); // Debug log
        throw error;
      }
      console.log('Company quote data received:', data); // Debug log
      return data[0];
    },
    enabled: !!urlTicker
  });

  useEffect(() => {
    console.log('Analysis component mounted/updated'); // Debug log
    console.log('Current URL ticker:', urlTicker);
    console.log('Active tab:', activeTab);
  }, [urlTicker, activeTab]);

  if (error || quoteError) {
    console.error('Rendering error state:', error || quoteError);
    return <div className="p-4">Error loading company data</div>;
  }

  if (isLoading) {
    console.log('Rendering loading state');
    return <div className="p-4">Loading...</div>;
  }

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

  console.log('Rendering Analysis component with data:', { selectedStock, activeTab });

  return (
    <div className="w-full">
      <CompanyHeader {...selectedStock} />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <AnalysisContent 
        activeTab={activeTab} 
        selectedStock={selectedStock} 
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Analysis;