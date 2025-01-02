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
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: CashFlowProps) => {
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['cash-flow-statement', ticker],
    queryFn: async () => {
      const data = await fetchFinancialData('cash-flow-statement', ticker);
      console.log('Cash Flow Statement API Response:', data);
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No cash flow data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  const ttmData = financialData.find((item: any) => item.period === 'TTM');
  
  const annualData = financialData
    .filter((item: any) => item.period === 'FY')
    .sort((a: any, b: any) => {
      const yearA = parseInt(a.calendarYear);
      const yearB = parseInt(b.calendarYear);
      return yearB - yearA;
    })
    .slice(0, 10);

  const sortedData = ttmData ? [ttmData, ...annualData] : annualData;

  const formatPeriod = (row: any) => {
    if (row.period === 'TTM') return 'TTM';
    return row.calendarYear || 'N/A';
  };

  const metrics = [
    { id: "netIncome", label: "Net Income" },
    { id: "depreciationAndAmortization", label: "Depreciation & Amortization" },
    { id: "deferredIncomeTax", label: "Deferred Income Tax" },
    { id: "stockBasedCompensation", label: "Stock Based Compensation" },
    { id: "changeInWorkingCapital", label: "Change in Working Capital" },
    { id: "accountsReceivables", label: "Accounts Receivables" },
    { id: "inventory", label: "Inventory" },
    { id: "accountsPayables", label: "Accounts Payables" },
    { id: "otherWorkingCapital", label: "Other Working Capital" },
    { id: "otherNonCashItems", label: "Other Non-Cash Items" },
    { id: "netCashProvidedByOperatingActivities", label: "Net Cash from Operating Activities" },
    { id: "investmentsInPropertyPlantAndEquipment", label: "Investments in PP&E" },
    { id: "acquisitionsNet", label: "Acquisitions (Net)" },
    { id: "purchasesOfInvestments", label: "Purchases of Investments" },
    { id: "salesMaturitiesOfInvestments", label: "Sales/Maturities of Investments" },
    { id: "otherInvestingActivites", label: "Other Investing Activities" },
    { id: "netCashUsedForInvestingActivites", label: "Net Cash from Investing Activities" },
    { id: "debtRepayment", label: "Debt Repayment" },
    { id: "commonStockIssued", label: "Common Stock Issued" },
    { id: "commonStockRepurchased", label: "Common Stock Repurchased" },
    { id: "dividendsPaid", label: "Dividends Paid" },
    { id: "otherFinancingActivites", label: "Other Financing Activities" },
    { id: "netCashUsedProvidedByFinancingActivities", label: "Net Cash from Financing Activities" },
    { id: "effectOfForexChangesOnCash", label: "Effect of Forex on Cash" },
    { id: "netChangeInCash", label: "Net Change in Cash" },
    { id: "cashAtEndOfPeriod", label: "Cash at End of Period" },
    { id: "cashAtBeginningOfPeriod", label: "Cash at Beginning of Period" },
    { id: "operatingCashFlow", label: "Operating Cash Flow" },
    { id: "capitalExpenditure", label: "Capital Expenditure" },
    { id: "freeCashFlow", label: "Free Cash Flow" }
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
                  {sortedData.map((row: any) => (
                    <TableHead key={row.date} className="text-right min-w-[120px]">
                      {formatPeriod(row)}
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
                    {sortedData.map((row: any) => (
                      <TableCell key={`${row.date}-${metric.id}`} className="text-right">
                        {formatValue(parseNumber(row[metric.id]))}
                      </TableCell>
                    ))}
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