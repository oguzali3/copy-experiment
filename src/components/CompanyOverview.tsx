import { Card } from "@/components/ui/card";

interface CompanyData {
  name: string;
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

export const CompanyOverview = ({ companyData }: { companyData: CompanyData }) => {
  return (
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
  );
};