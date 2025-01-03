import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DCFAnalysisProps {
  ticker: string;
}

export const DCFAnalysis = ({ ticker }: DCFAnalysisProps) => {
  const { data: dcfData, isLoading, error } = useQuery({
    queryKey: ['dcf-analysis', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'dcf', symbol: ticker }
      });
      if (error) throw error;
      console.log('DCF Data received:', data);
      return data[0]; // Get the first year's data
    },
    enabled: !!ticker
  });

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading DCF analysis...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading DCF analysis. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!dcfData) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No DCF data available for {ticker}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Get the current stock price and DCF value
  const stockPrice = dcfData.price || 0;
  const dcfValue = dcfData.equityValuePerShare || 0;
  
  // Calculate margin of safety
  const marginOfSafety = dcfValue > 0 ? ((dcfValue - stockPrice) / stockPrice) * 100 : 0;
  
  // Get the growth rate
  const growthRate = dcfData.longTermGrowthRate || 0;

  // Prepare data for the chart
  const chartData = [
    {
      year: dcfData.year,
      freeCashFlow: dcfData.ufcf,
      presentValue: dcfData.sumPvUfcf
    }
  ];

  return (
    <Card className="bg-white mb-6">
      <CardHeader>
        <CardTitle>Advanced DCF Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Current Stock Price</p>
            <p className="text-2xl font-semibold">{formatCurrency(stockPrice)}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">DCF Value</p>
            <p className="text-2xl font-semibold">{formatCurrency(dcfValue)}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Margin of Safety</p>
            <p className={`text-2xl font-semibold ${marginOfSafety >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marginOfSafety.toFixed(2)}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className="text-2xl font-semibold">{growthRate.toFixed(2)}%</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="freeCashFlow"
                stroke="#2563eb"
                strokeWidth={2}
                name="Free Cash Flow"
              />
              <Line
                type="monotone"
                dataKey="presentValue"
                stroke="#4f46e5"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Present Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};