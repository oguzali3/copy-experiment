import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DcfAnalysisProps {
  ticker: string;
}

export const DcfAnalysis = ({ ticker }: DcfAnalysisProps) => {
  const { data: dcfData, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <Card className="p-6 mb-6">
        <p className="text-center text-gray-500">Loading DCF analysis...</p>
      </Card>
    );
  }

  if (!dcfData) {
    return (
      <Card className="p-6 mb-6">
        <p className="text-center text-gray-500">No DCF data available</p>
      </Card>
    );
  }

  const valueGap = ((dcfData.dcf - dcfData["Stock Price"]) / dcfData["Stock Price"]) * 100;
  const isUndervalued = valueGap > 0;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">DCF Analysis</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">DCF Value</p>
          <p className="font-medium">${dcfData.dcf.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="font-medium">${dcfData["Stock Price"]}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Analysis Date</p>
          <p className="font-medium">{new Date(dcfData.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Value Gap</p>
          <p className={cn(
            "font-medium",
            isUndervalued ? "text-green-600" : "text-red-600"
          )}>
            {valueGap.toFixed(2)}%
          </p>
        </div>
      </div>
    </Card>
  );
};