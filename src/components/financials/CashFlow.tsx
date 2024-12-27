import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface CashFlowProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const CashFlow = ({ timeFrame, selectedMetrics, onMetricsChange }: CashFlowProps) => {
  const data = {
    annual: [
      { year: "2023", operatingCashFlow: "27,021", investingCashFlow: "-15,783", financingCashFlow: "-8,762", freeCashFlow: "27,021" },
      { year: "2022", operatingCashFlow: "3,808", investingCashFlow: "-7,225", financingCashFlow: "-10,413", freeCashFlow: "3,808" },
      { year: "2021", operatingCashFlow: "8,132", investingCashFlow: "-4,485", financingCashFlow: "-3,128", freeCashFlow: "8,132" },
      { year: "2020", operatingCashFlow: "4,694", investingCashFlow: "-3,892", financingCashFlow: "-2,654", freeCashFlow: "4,694" },
      { year: "2019", operatingCashFlow: "4,272", investingCashFlow: "-2,987", financingCashFlow: "-1,876", freeCashFlow: "4,272" }
    ],
    quarterly: [
      { year: "Q4 2023", operatingCashFlow: "8,761", investingCashFlow: "-5,234", financingCashFlow: "-2,987", freeCashFlow: "8,761" },
      { year: "Q3 2023", operatingCashFlow: "7,892", investingCashFlow: "-4,567", financingCashFlow: "-2,345", freeCashFlow: "7,892" },
      { year: "Q2 2023", operatingCashFlow: "6,234", investingCashFlow: "-3,876", financingCashFlow: "-1,987", freeCashFlow: "6,234" }
    ],
    ttm: [
      { year: "TTM", operatingCashFlow: "56,546", investingCashFlow: "-32,456", financingCashFlow: "-18,234", freeCashFlow: "56,546" }
    ],
  };

  const currentData = data[timeFrame];

  const metrics = [
    { id: "operatingCashFlow", label: "Operating Cash Flow" },
    { id: "investingCashFlow", label: "Investing Cash Flow" },
    { id: "financingCashFlow", label: "Financing Cash Flow" },
    { id: "freeCashFlow", label: "Free Cash Flow" }
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