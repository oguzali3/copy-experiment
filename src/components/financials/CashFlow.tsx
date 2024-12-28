import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface CashFlowProps {
  data: any[];
  timeRange: string;
}

export const CashFlow = ({ data = [], timeRange }: CashFlowProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const metrics = [
    { id: "operatingCashFlow", label: "Operating Cash Flow" },
    { id: "investingCashFlow", label: "Investing Cash Flow" },
    { id: "financingCashFlow", label: "Financing Cash Flow" },
    { id: "netCashFlow", label: "Net Cash Flow" }
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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