import { MetricChart } from "./MetricChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BalanceSheetProps {
  data: any[];
  timeRange: string;
}

export const BalanceSheet = ({ data = [], timeRange }: BalanceSheetProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const sortedData = [...(data || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  const metrics = [
    { key: "totalAssets", label: "Total Assets" },
    { key: "totalLiabilities", label: "Total Liabilities" },
    { key: "totalEquity", label: "Total Equity" },
    { key: "cashAndEquivalents", label: "Cash & Equivalents" },
    { key: "shortTermDebt", label: "Short Term Debt" },
    { key: "longTermDebt", label: "Long Term Debt" }
  ];

  const chartData = sortedData.map(period => ({
    period: new Date(period.date).getFullYear().toString(),
    metrics: metrics.map(metric => ({
      name: metric.label,
      value: period[metric.key] || 0
    }))
  }));

  const handleMetricSelect = (metricName: string) => {
    if (selectedMetrics.includes(metricName)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metricName));
      const newMetricTypes = { ...metricTypes };
      delete newMetricTypes[metricName];
      setMetricTypes(newMetricTypes);
    } else {
      setSelectedMetrics([...selectedMetrics, metricName]);
      setMetricTypes(prev => ({
        ...prev,
        [metricName]: 'bar'
      }));
    }
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  if (!data || data.length === 0) {
    return <div>No balance sheet data available.</div>;
  }

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <MetricChart
          data={chartData}
          metrics={selectedMetrics}
          metricTypes={metricTypes}
          onMetricTypeChange={handleMetricTypeChange}
        />
      )}
      
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Metric</TableHead>
              {sortedData.map((period) => (
                <TableHead key={period.date} className="text-right">
                  {new Date(period.date).getFullYear()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.key}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.label)}
                      onChange={() => handleMetricSelect(metric.label)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    {metric.label}
                  </div>
                </TableCell>
                {sortedData.map((period) => (
                  <TableCell key={period.date} className="text-right">
                    ${formatNumber(period[metric.key] || 0)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};