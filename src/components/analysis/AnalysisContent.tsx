import { CompanyNewsContent } from "@/components/CompanyNewsContent";
import { CompanyEventsContent } from "@/components/CompanyEventsContent";
import { FinancialStatements } from "@/components/FinancialStatements";
import { EstimatesChart } from "@/components/valuation/EstimatesChart";
import { ValuationMetrics } from "@/components/valuation/ValuationMetrics";
import { TranscriptsContent } from "@/components/analysis/TranscriptsContent";
import { FilingsContent } from "@/components/analysis/FilingsContent";
import { OwnershipTabs } from "@/components/ownership/OwnershipTabs";
import { AnalysisOverview } from "./AnalysisOverview";

interface AnalysisContentProps {
  activeTab: string;
  selectedStock: any;
  onTabChange: (tab: string) => void;
}

export const AnalysisContent = ({ activeTab, selectedStock, onTabChange }: AnalysisContentProps) => {
  console.log('AnalysisContent rendering with:', { activeTab, selectedStock }); // Debug log

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab); // Debug log
    
    switch (activeTab) {
      case "overview":
        return <AnalysisOverview selectedStock={selectedStock} onTabChange={onTabChange} />;
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
            <ValuationMetrics ticker={selectedStock.ticker} />
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
      case "ownership":
        return (
          <div className="space-y-6">
            <OwnershipTabs ticker={selectedStock.ticker} />
          </div>
        );
      default:
        console.log('No matching tab found:', activeTab); // Debug log
        return (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-gray-500">Content for {activeTab} is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
};