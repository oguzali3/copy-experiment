import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const IncomeStatement = ({ timeFrame, selectedMetrics, onMetricsChange, ticker }: IncomeStatementProps) => {
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['income-statement', ticker],
    queryFn: () => fetchFinancialData('income-statement', ticker),
    enabled: !!ticker,
  });

  console.log('Income Statement Data:', financialData);

  const metrics = [
    { id: "revenue", label: "Revenue", key: "revenue" },
    { id: "revenueGrowth", label: "Revenue Growth", key: "revenueGrowth" },
    { id: "costOfRevenue", label: "Cost of Revenue", key: "costOfRevenue" },
    { id: "grossProfit", label: "Gross Profit", key: "grossProfit" },
    { id: "sga", label: "SG&A", key: "sellingGeneralAndAdministrativeExpenses" },
    { id: "researchDevelopment", label: "R&D", key: "researchAndDevelopmentExpenses" },
    { id: "operatingExpenses", label: "Operating Expenses", key: "operatingExpenses" },
    { id: "operatingIncome", label: "Operating Income", key: "operatingIncome" },
    { id: "netIncome", label: "Net Income", key: "netIncome" },
    { id: "ebitda", label: "EBITDA", key: "ebitda" }
  ];

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
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
          Error loading financial data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter data based on timeFrame
  const filteredData = financialData?.filter((item: any) => {
    if (timeFrame === "annual") {
      return item.period === "FY";
    }
    if (timeFrame === "quarterly") {
      return item.period === "Q1" || item.period === "Q2" || item.period === "Q3" || item.period === "Q4";
    }
    return true;
  }) || [];

  // Sort data by date in descending order
  const sortedData = [...filteredData].sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Take only the last 5 periods
  const currentData = sortedData.slice(0, 5);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
              {currentData.map((row: any) => (
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
                {currentData.map((row: any) => (
                  <TableCell key={`${row.date}-${metric.id}`} className="text-right">
                    {formatValue(row[metric.key] || 0)}
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