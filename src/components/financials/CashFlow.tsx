import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Checkbox } from "@/components/ui/checkbox";

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
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['cash-flow', ticker],
    queryFn: () => fetchFinancialData('cash-flow', ticker),
    enabled: !!ticker,
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading cash flow data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No cash flow data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Get TTM data first
  const ttmData = financialData.find((item: any) => item.period === 'TTM');
  
  // Get annual data sorted by date
  const annualData = financialData
    .filter((item: any) => item.period === 'FY')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Get last 10 years

  // Combine TTM with annual data
  const filteredData = ttmData ? [ttmData, ...annualData] : annualData;

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
              {filteredData.map((row: any) => (
                <TableHead key={row.date} className="text-right min-w-[120px]">
                  {row.period === 'TTM' ? 'TTM' : new Date(row.date).getFullYear()}
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
                {filteredData.map((row: any) => (
                  <TableCell key={`${row.date}-${metric.id}`} className="text-right">
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