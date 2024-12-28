import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Checkbox } from "@/components/ui/checkbox";

interface BalanceSheetProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const BalanceSheet = ({ 
  timeFrame, 
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: BalanceSheetProps) => {
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['balance-sheet', ticker],
    queryFn: () => fetchFinancialData('balance-sheet', ticker),
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
          Error loading balance sheet data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No balance sheet data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter for annual data and sort by date
  const filteredData = financialData
    .filter((item: any) => item.period === "FY")
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4); // Get last 4 years

  const metrics = [
    { id: "totalAssets", label: "Total Assets" },
    { id: "totalLiabilities", label: "Total Liabilities" },
    { id: "totalEquity", label: "Total Equity" },
    { id: "cashAndCashEquivalents", label: "Cash & Cash Equivalents" },
    { id: "shortTermInvestments", label: "Short Term Investments" },
    { id: "netReceivables", label: "Net Receivables" },
    { id: "inventory", label: "Inventory" },
    { id: "propertyPlantEquipmentNet", label: "Property, Plant & Equipment" },
    { id: "goodwill", label: "Goodwill" },
    { id: "intangibleAssets", label: "Intangible Assets" },
    { id: "longTermDebt", label: "Long Term Debt" },
    { id: "accountsPayable", label: "Accounts Payable" },
    { id: "totalCurrentAssets", label: "Total Current Assets" },
    { id: "totalCurrentLiabilities", label: "Total Current Liabilities" },
    { id: "totalNonCurrentAssets", label: "Total Non-Current Assets" },
    { id: "totalNonCurrentLiabilities", label: "Total Non-Current Liabilities" }
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
                  {new Date(row.date).toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'short'
                  })}
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