import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CompanyOverviewProps {
  summary: string;
  ceo: string;
  founded: string;
  website: string;
  ticker: string;
  ratios: {
    peRatio: string;
    pbRatio: string;
    debtToEquity: string;
    currentRatio: string;
    quickRatio: string;
    returnOnEquity: string;
  };
}

export const CompanyOverview = ({ summary, ceo, founded, website, ticker, ratios }: CompanyOverviewProps) => {
  const { data: dcfData } = useQuery({
    queryKey: ['dcf', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'dcf', symbol: ticker }
      });

      if (error) throw error;
      return data[0];
    },
    enabled: !!ticker
  });

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
        {dcfData && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">DCF Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">DCF Value</p>
                <p className="font-medium">${dcfData.dcf?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="font-medium">${dcfData["Stock Price"]?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Analysis Date</p>
                <p className="font-medium">{new Date(dcfData.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Value Gap</p>
                <p className={`font-medium ${dcfData.dcf > dcfData["Stock Price"] ? "text-green-600" : "text-red-600"}`}>
                  {((dcfData.dcf - dcfData["Stock Price"]) / dcfData["Stock Price"] * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};