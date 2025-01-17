import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['cash-flow-statement', ticker, period],
    queryFn: async () => {
      const data = await fetchFinancialData('cash-flow-statement', ticker, period);
      console.log('Raw Cash Flow Statement API Response:', data);
      return data;
    },
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No cash flow data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Sort data by date in descending order and limit to 20 items if quarterly
  const sortedData = [...financialData]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, period === 'quarter' ? 20 : 10);

  const formatPeriod = (date: string) => {
    return new Date(date).getFullYear().toString();
  };

  // Define metrics with exact field names from API response
  const metrics = [
    { id: "netIncome", label: "Net Income", field: "netIncome" },
    { id: "depreciationAndAmortization", label: "Depreciation & Amortization", field: "depreciationAndAmortization" },
    { id: "deferredIncomeTax", label: "Deferred Income Tax", field: "deferredIncomeTax" },
    { id: "stockBasedCompensation", label: "Stock Based Compensation", field: "stockBasedCompensation" },
    { id: "changeInWorkingCapital", label: "Change in Working Capital", field: "changeInWorkingCapital" },
    { id: "accountsReceivables", label: "Accounts Receivables", field: "accountsReceivables" },
    { id: "inventory", label: "Inventory", field: "inventory" },
    { id: "accountsPayables", label: "Accounts Payables", field: "accountsPayables" },
    { id: "otherWorkingCapital", label: "Other Working Capital", field: "otherWorkingCapital" },
    { id: "otherNonCashItems", label: "Other Non-Cash Items", field: "otherNonCashItems" },
    { id: "netCashProvidedByOperatingActivities", label: "Net Cash from Operating Activities", field: "netCashProvidedByOperatingActivities" },
    { id: "investmentsInPropertyPlantAndEquipment", label: "Investments in PP&E", field: "investmentsInPropertyPlantAndEquipment" },
    { id: "acquisitionsNet", label: "Acquisitions (Net)", field: "acquisitionsNet" },
    { id: "purchasesOfInvestments", label: "Purchases of Investments", field: "purchasesOfInvestments" },
    { id: "salesMaturitiesOfInvestments", label: "Sales/Maturities of Investments", field: "salesMaturitiesOfInvestments" },
    { id: "otherInvestingActivites", label: "Other Investing Activities", field: "otherInvestingActivites" },
    { id: "netCashUsedForInvestingActivites", label: "Net Cash from Investing Activities", field: "netCashUsedForInvestingActivites" },
    { id: "debtRepayment", label: "Debt Repayment", field: "debtRepayment" },
    { id: "commonStockIssued", label: "Common Stock Issued", field: "commonStockIssued" },
    { id: "commonStockRepurchased", label: "Common Stock Repurchased", field: "commonStockRepurchased" },
    { id: "dividendsPaid", label: "Dividends Paid", field: "dividendsPaid" },
    { id: "otherFinancingActivites", label: "Other Financing Activities", field: "otherFinancingActivites" },
    { id: "netCashUsedProvidedByFinancingActivities", label: "Net Cash from Financing Activities", field: "netCashUsedProvidedByFinancingActivities" },
    { id: "effectOfForexChangesOnCash", label: "Effect of Forex on Cash", field: "effectOfForexChangesOnCash" },
    { id: "netChangeInCash", label: "Net Change in Cash", field: "netChangeInCash" },
    { id: "cashAtEndOfPeriod", label: "Cash at End of Period", field: "cashAtEndOfPeriod" },
    { id: "cashAtBeginningOfPeriod", label: "Cash at Beginning of Period", field: "cashAtBeginningOfPeriod" },
    { id: "operatingCashFlow", label: "Operating Cash Flow", field: "operatingCashFlow" },
    { id: "capitalExpenditure", label: "Capital Expenditure", field: "capitalExpenditure" },
    { id: "freeCashFlow", label: "Free Cash Flow", field: "freeCashFlow" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <ScrollArea className="w-full rounded-md">
          <div className="max-w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
                  <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Metrics</TableHead>
                  {sortedData.map((row, index) => (
                    <TableHead key={`${row.date}-${index}`} className="text-right min-w-[120px]">
                      {formatPeriod(row.date)}
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
                    {sortedData.map((row, index) => {
                      const value = row[metric.field] || 0;
                      return (
                        <TableCell key={`${row.date}-${metric.id}-${index}`} className="text-right">
                          {formatValue(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
