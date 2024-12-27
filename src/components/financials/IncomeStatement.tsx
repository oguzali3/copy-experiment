import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { financialData } from "@/data/financialData";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const IncomeStatement = ({ timeFrame, selectedMetrics, onMetricsChange, ticker }: IncomeStatementProps) => {
  const currentData = financialData[ticker]?.[timeFrame] || [];

  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "revenueGrowth", label: "Revenue Growth" },
    { id: "costOfRevenue", label: "Cost of Revenue" },
    { id: "grossProfit", label: "Gross Profit" },
    { id: "sga", label: "SG&A" },
    { id: "researchDevelopment", label: "R&D" },
    { id: "operatingExpenses", label: "Operating Expenses" },
    { id: "operatingIncome", label: "Operating Income" },
    { id: "netIncome", label: "Net Income" },
    { id: "ebitda", label: "EBITDA" }
  ];

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
              {currentData.map((row) => (
                <TableHead key={row.period} className="text-right min-w-[120px]">{row.period}</TableHead>
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
                  <TableCell key={`${row.period}-${metric.id}`} className="text-right">
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