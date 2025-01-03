import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EstimatesMetricSelector } from "./EstimatesMetricSelector";
import { EstimatesTable } from "./EstimatesTable";

interface EstimatesChartProps {
  ticker?: string;
}

export const EstimatesChart = ({ ticker }: EstimatesChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const { data: estimatesData, isLoading, error } = useQuery({
    queryKey: ['analyst-estimates', ticker],
    queryFn: async () => {
      if (!ticker) return null;
      
      console.log('Fetching analyst estimates for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-analyst-estimates', {
        body: { symbol: ticker }
      });

      if (error) {
        console.error('Error fetching analyst estimates:', error);
        throw error;
      }

      console.log('Received analyst estimates data:', data);
      return data;
    },
    enabled: !!ticker,
  });

  const formatValue = (value: number) => {
    if (selectedMetric === 'eps') {
      return `$${value.toFixed(2)}`;
    }
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
  };

  if (!ticker) {
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Select a stock to view estimates</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Loading estimates data...</p>
      </div>
    );
  }

  if (error) {
    console.error('Error in EstimatesChart:', error);
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading estimates data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!estimatesData?.length) {
    console.log('No estimates data available');
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
        <p className="text-gray-500">No estimates data available for {ticker}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <EstimatesMetricSelector
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
        />

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={estimatesData}
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <XAxis
                dataKey="period"
                tickFormatter={(value) => value.split("-")[0]}
              />
              <YAxis
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip
                formatter={(value: any) => formatValue(value)}
                labelFormatter={(label) => `Period: ${label}`}
              />
              
              <Line
                type="monotone"
                dataKey={`${selectedMetric}.actual`}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Actual"
              />
              
              <Line
                type="monotone"
                dataKey={`${selectedMetric}.mean`}
                stroke="#4f46e5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Consensus"
              />

              <ReferenceArea
                y1={`${selectedMetric}.high`}
                y2={`${selectedMetric}.low`}
                fill="#4f46e5"
                fillOpacity={0.1}
                ifOverflow="extendDomain"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <EstimatesTable
        data={estimatesData}
        selectedMetric={selectedMetric}
        formatValue={formatValue}
      />
    </div>
  );
};