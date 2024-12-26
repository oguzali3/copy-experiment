import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { MetricChart } from "./MetricChart";

interface BalanceSheetProps {
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const BalanceSheet = ({ timeFrame }: BalanceSheetProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const data = {
    annual: [
      { year: "2023", totalAssets: "110,716", totalLiabilities: "42,781", totalEquity: "67,935" },
      { year: "2022", totalAssets: "44,187", totalLiabilities: "15,892", totalEquity: "28,295" },
      { year: "2021", totalAssets: "44,187", totalLiabilities: "15,892", totalEquity: "28,295" },
      { year: "2020", totalAssets: "28,791", totalLiabilities: "10,418", totalEquity: "18,373" },
      { year: "2019", totalAssets: "17,315", totalLiabilities: "6,232", totalEquity: "11,083" }
    ],
    quarterly: [
      { year: "Q4 2023", totalAssets: "110,716", totalLiabilities: "42,781", totalEquity: "67,935" },
      { year: "Q3 2023", totalAssets: "102,483", totalLiabilities: "39,876", totalEquity: "62,607" },
      { year: "Q2 2023", totalAssets: "92,154", totalLiabilities: "35,891", totalEquity: "56,263" }
    ],
    ttm: [
      { year: "TTM", totalAssets: "110,716", totalLiabilities: "42,781", totalEquity: "67,935" }
    ],
  };

  const currentData = data[timeFrame];

  const metrics = [
    { id: "totalAssets", label: "Total Assets" },
    { id: "totalLiabilities", label: "Total Liabilities" },
    { id: "totalEquity", label: "Total Equity" }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      }
      return [...prev, metricId];
    });
  };

  const getChartData = (metricId: string) => {
    return currentData.map(row => ({
      period: row.year,
      value: parseFloat(row[metricId as keyof typeof row].replace(/,/g, '')),
    }));
  };

  return (
    <div className="space-y-6">
      {selectedMetrics.map(metricId => (
        <MetricChart 
          key={metricId}
          data={getChartData(metricId)}
          metric={metrics.find(m => m.id === metricId)?.label || ''}
        />
      ))}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
              {currentData.map((row) => (
                <TableHead key={row.year} className="text-right min-w-[120px]">{row.year}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="w-[50px] pr-0">
                  <Checkbox
                    id={`checkbox-${metric.id}`}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                </TableCell>
                <TableCell className="font-medium bg-gray-50">{metric.label}</TableCell>
                {currentData.map((row) => (
                  <TableCell key={`${row.year}-${metric.id}`} className="text-right">
                    ${row[metric.id as keyof typeof row]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};