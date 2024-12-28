import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface BalanceSheetProps {
  data: any[];
  timeRange: string;
}

export const BalanceSheet = ({ data = [], timeRange }: BalanceSheetProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const metrics = [
    { id: "totalAssets", label: "Total Assets" },
    { id: "totalLiabilities", label: "Total Liabilities" },
    { id: "totalEquity", label: "Total Equity" }
  ];

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    setSelectedMetrics(newMetrics);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
              {data.map((row) => (
                <TableHead key={row.date} className="text-right min-w-[120px]">
                  {new Date(row.date).getFullYear()}
                </TableHead>
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
                {data.map((row) => (
                  <TableCell key={`${row.date}-${metric.id}`} className="text-right">
                    ${row[metric.id] || 0}
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