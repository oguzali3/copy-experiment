import { Card } from "@/components/ui/card";

interface CompanyOverviewProps {
  companyData: {
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
  };
}

export const CompanyOverview = ({ companyData }: CompanyOverviewProps) => {
  return (
    <Card className="p-6 h-full overflow-y-auto"> {/* Changed to h-full */}
      <h2 className="text-lg font-semibold mb-4">Company Overview</h2>
      <div className="space-y-4">
        <p className="text-gray-600">{companyData.summary}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">CEO</p>
            <p className="font-medium">{companyData.ceo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Founded</p>
            <p className="font-medium">{companyData.founded}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="font-medium text-blue-600">{companyData.website}</p>
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Key Ratios</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">P/E Ratio</p>
              <p className="font-medium">{companyData.ratios.peRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">P/B Ratio</p>
              <p className="font-medium">{companyData.ratios.pbRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Debt/Equity</p>
              <p className="font-medium">{companyData.ratios.debtToEquity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Ratio</p>
              <p className="font-medium">{companyData.ratios.currentRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quick Ratio</p>
              <p className="font-medium">{companyData.ratios.quickRatio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ROE</p>
              <p className="font-medium">{companyData.ratios.returnOnEquity}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};