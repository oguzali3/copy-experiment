import { Card } from "@/components/ui/card";

interface CompanyOverviewProps {
  summary: string;
  ceo: string;
  founded: string;
  website: string;
  ratios: {
    peRatio: string;
    pbRatio: string;
    debtToEquity: string;
    currentRatio: string;
    quickRatio: string;
    returnOnEquity: string;
  };
}

export const CompanyOverview = ({ summary, ceo, founded, website, ratios }: CompanyOverviewProps) => {
  return (
    <Card className="p-6 h-[500px] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Company Overview</h2>
      <div className="space-y-4">
        <p className="text-gray-600">{summary}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">CEO</p>
            <p className="font-medium">{ceo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Founded</p>
            <p className="font-medium">{founded}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="font-medium text-blue-600">{website}</p>
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Key Ratios</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">P/E Ratio</p>
              <p className="font-medium">{ratios.peRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">P/B Ratio</p>
              <p className="font-medium">{ratios.pbRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Debt/Equity</p>
              <p className="font-medium">{ratios.debtToEquity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Ratio</p>
              <p className="font-medium">{ratios.currentRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quick Ratio</p>
              <p className="font-medium">{ratios.quickRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ROE</p>
              <p className="font-medium">{ratios.returnOnEquity}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};