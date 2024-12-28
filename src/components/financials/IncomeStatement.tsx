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

  console.log('Raw Financial Data:', financialData); // Debug log

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  // Function to format metric labels from API keys
  const formatMetricLabel = (key: string): string => {
    // Remove common prefixes if present
    let label = key.replace(/^total|^gross|^net/, '');
    
    // Split by capital letters and join with spaces
    label = label.replace(/([A-Z])/g, ' $1').trim();
    
    // Capitalize first letter of each word
    label = label.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Handle special cases
    label = label.replace(/Ebit/g, 'EBIT')
      .replace(/Ebitda/g, 'EBITDA')
      .replace(/R And D/g, 'R&D')
      .replace(/Sg And A/g, 'SG&A');

    return label;
  };

  // Function to get all available metrics from the API response
  const getAvailableMetrics = () => {
    if (!financialData?.[0]) {
      console.log('No financial data available'); // Debug log
      return [];
    }
    
    // Get all keys from the first data point
    const allKeys = Object.keys(financialData[0]);
    console.log('Available keys:', allKeys); // Debug log
    
    // Filter out non-metric keys and sort alphabetically
    const metrics = allKeys
      .filter(key => 
        !['date', 'symbol', 'reportedCurrency', 'period', 'link', 'finalLink'].includes(key) &&
        typeof financialData[0][key] === 'number'
      )
      .sort((a, b) => formatMetricLabel(a).localeCompare(formatMetricLabel(b)));
    
    console.log('Filtered metrics:', metrics); // Debug log
    return metrics;
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

  if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No financial data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter data based on timeFrame
  const filteredData = financialData.filter((item: any) => {
    if (timeFrame === "annual") {
      return item.period === "FY";
    }
    if (timeFrame === "quarterly") {
      return item.period === "Q1" || item.period === "Q2" || item.period === "Q3" || item.period === "Q4";
    }
    return true;
  });

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

  const availableMetrics = getAvailableMetrics();

  if (availableMetrics.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No metrics available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

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
            {availableMetrics.map((metricId) => (
              <TableRow key={metricId}>
                <TableCell className="w-[50px] pr-0">
                  <Checkbox
                    id={`checkbox-${metricId}`}
                    checked={selectedMetrics.includes(metricId)}
                    onCheckedChange={() => handleMetricToggle(metricId)}
                  />
                </TableCell>
                <TableCell className="font-medium bg-gray-50">
                  {formatMetricLabel(metricId)}
                </TableCell>
                {currentData.map((row: any) => (
                  <TableCell key={`${row.date}-${metricId}`} className="text-right">
                    {formatValue(row[metricId] || 0)}
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