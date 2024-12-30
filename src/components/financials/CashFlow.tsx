import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { financialData } from "@/data/financialData";

interface CashFlowProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const CashFlow = ({ 
  timeFrame,
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: CashFlowProps) => {
  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(value.toString().replace(/,/g, ''));
  };

  // Get data from financialData object
  const data = financialData[ticker]?.[timeFrame] || [];
  
  if (!data || data.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No cash flow data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Sort data by period (TTM first, then by year descending)
  const sortedData = [...data].sort((a, b) => {
    if (a.period === 'TTM') return -1;
    if (b.period === 'TTM') return 1;
    return parseInt(b.period) - parseInt(a.period);
  });

  const metrics = [
    { id: "operatingCashFlow", label: "Operating Cash Flow" },
    { id: "netCashFlow", label: "Net Cash Flow" },
    { id: "cashAtEndOfPeriod", label: "Cash at End of Period" },
    { id: "capitalExpenditure", label: "Capital Expenditure" },
    { id: "freeCashFlow", label: "Free Cash Flow" },
    { id: "investingCashFlow", label: "Investing Cash Flow" },
    { id: "financingCashFlow", label: "Financing Cash Flow" },
    { id: "cashAtBeginningOfPeriod", label: "Cash at Beginning of Period" },
    { id: "changeInWorkingCapital", label: "Change in Working Capital" },
    { id: "stockBasedCompensation", label: "Stock-based Compensation" },
    { id: "depreciation", label: "Depreciation & Amortization" },
    { id: "dividendsPaid", label: "Dividends Paid" },
    { id: "stockSaleAndPurchase", label: "Stock Sale & Purchase" },
    { id: "debtRepayment", label: "Debt Repayment" }
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
              {sortedData.map((row) => (
                <TableHead key={row.period} className="text-right min-w-[120px]">
                  {row.period}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                  <Checkbox
                    id={`checkbox-${metric.id}`}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                </TableCell>
                <TableCell className="font-medium sticky left-[50px] z-20 bg-gray-50">
                  {metric.label}
                </TableCell>
                {sortedData.map((row) => (
                  <TableCell key={`${row.period}-${metric.id}`} className="text-right">
                    {formatValue(parseNumber(row[metric.id]))}
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