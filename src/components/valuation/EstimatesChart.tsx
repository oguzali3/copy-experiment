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
  ReferenceDot,
  ReferenceArea,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "eps", label: "EPS" },
    { id: "ebitda", label: "EBITDA" },
    { id: "netIncome", label: "Net Income" },
  ];

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

  console.log('Rendering chart with data:', {
    selectedMetric,
    dataPoints: estimatesData.length,
    firstPoint: estimatesData[0],
    lastPoint: estimatesData[estimatesData.length - 1]
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex gap-2 mb-6">
          {metrics.map((metric) => (
            <Button
              key={metric.id}
              variant={selectedMetric === metric.id ? "default" : "outline"}
              onClick={() => setSelectedMetric(metric.id)}
            >
              {metric.label}
            </Button>
          ))}
        </div>

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
              
              {/* Actual values line */}
              <Line
                type="monotone"
                dataKey={`${selectedMetric}.actual`}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Actual"
              />
              
              {/* Mean estimate line */}
              <Line
                type="monotone"
                dataKey={`${selectedMetric}.mean`}
                stroke="#4f46e5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Consensus"
              />

              {/* Range area between high and low estimates */}
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

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Consensus</TableHead>
              <TableHead className="text-right">High</TableHead>
              <TableHead className="text-right">Low</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimatesData?.map((estimate: any) => (
              <TableRow key={estimate.period}>
                <TableCell>{estimate.period}</TableCell>
                <TableCell className="text-right">
                  {formatValue(estimate[selectedMetric].actual || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatValue(estimate[selectedMetric].mean || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatValue(estimate[selectedMetric].high || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatValue(estimate[selectedMetric].low || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};