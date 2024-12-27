import { CompanyOverview } from "./CompanyOverview";
import { StockChart } from "@/components/StockChart";
import { Button } from "@/components/ui/button";
import { CompanyNewsContent } from "@/components/CompanyNewsContent";

interface AnalysisOverviewProps {
  selectedStock: any;
  onTabChange: (tab: string) => void;
}

export const AnalysisOverview = ({ selectedStock, onTabChange }: AnalysisOverviewProps) => {
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
            onClick={() => onTabChange("news")}
          >
            View All News →
          </Button>
        </div>
        <CompanyNewsContent ticker={selectedStock.ticker} limit={5} />
      </div>
    </div>
  );
};