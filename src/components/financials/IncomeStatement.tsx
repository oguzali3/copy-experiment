import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { MetricRow } from "./MetricRow";
import { orderedMetricIds, metricKeyMapping, getMetricOrder } from "@/utils/financialMetricsOrder";
import { Checkbox } from "@/components/ui/checkbox";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const IncomeStatement = ({ 
  timeFrame, 
  selectedMetrics, 
  onMetricsChange, 
  ticker 
}: IncomeStatementProps) => {
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['income-statement', ticker],
    queryFn: () => fetchFinancialData('income-statement', ticker),
    enabled: !!ticker,
  });

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  const formatMetricLabel = (key: string): string => {
    let label = key.replace(/^total|^gross|^net/, '');
    label = label.replace(/([A-Z])/g, ' $1').trim();
    label = label.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return label.replace(/Ebit/g, 'EBIT')
      .replace(/Ebitda/g, 'EBITDA')
      .replace(/R And D/g, 'R&D')
      .replace(/Sg And A/g, 'SG&A');
  };

  const parseNumber = (value: any, isGrowthMetric: boolean = false): number => {
    console.log('Parsing value:', value, 'isGrowthMetric:', isGrowthMetric);
    
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    let result;
    if (isGrowthMetric) {
      // For growth metrics, handle percentage strings
      result = typeof value === 'string' 
        ? parseFloat(value.replace('%', '')) 
        : parseFloat(value);
    } else {
      // For other metrics, remove commas before parsing
      result = parseFloat(value.toString().replace(/,/g, ''));
    }
    
    console.log('Parsed result:', result);
    return isNaN(result) ? 0 : result;
  };

  const formatValue = (value: number, isPercentage?: boolean) => {
    if (isPercentage) {
      return `${value.toFixed(2)}%`;
    }
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

  // Log the raw financial data to inspect revenue growth values
  console.log('Financial Data:', financialData);

  const filteredData = financialData
    .filter((item: any) => {
      if (timeFrame === "annual") return item.period === "FY";
      if (timeFrame === "quarterly") return ["Q1", "Q2", "Q3", "Q4"].includes(item.period);
      return true;
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Log the filtered data to inspect revenue growth values
  console.log('Filtered Data:', filteredData);

  const availableMetrics = Object.keys(financialData[0])
    .filter(key => 
      !['date', 'symbol', 'reportedCurrency', 'period', 'link', 'finalLink'].includes(key) &&
      typeof financialData[0][key] === 'number'
    )
    .sort((a, b) => getMetricOrder(a) - getMetricOrder(b));

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
            {/* Revenue Row */}
            <TableRow>
              <TableCell className="w-[50px] pr-0">
                <Checkbox
                  id="checkbox-revenue"
                  checked={selectedMetrics.includes('revenue')}
                  onCheckedChange={() => handleMetricToggle('revenue')}
                />
              </TableCell>
              <TableCell className="font-medium bg-gray-50">
                Revenue
              </TableCell>
              {filteredData.map((row: any) => (
                <TableCell key={`${row.date}-revenue`} className="text-right">
                  {formatValue(parseNumber(row.revenue))}
                </TableCell>
              ))}
            </TableRow>

            {/* Revenue Growth Row */}
            <TableRow>
              <TableCell className="w-[50px] pr-0">
                <Checkbox
                  id="checkbox-revenueGrowth"
                  checked={selectedMetrics.includes('revenueGrowth')}
                  onCheckedChange={() => handleMetricToggle('revenueGrowth')}
                />
              </TableCell>
              <TableCell className="font-medium bg-gray-50 pl-8">
                Revenue Growth (YoY)
              </TableCell>
              {filteredData.map((row: any) => {
                console.log('Revenue Growth for row:', row.date, row.revenueGrowth);
                const growthValue = parseNumber(row.revenueGrowth, true);
                console.log('Parsed Growth Value:', growthValue);
                
                return (
                  <TableCell 
                    key={`${row.date}-revenueGrowth`} 
                    className={`text-right ${
                      growthValue > 0 
                        ? 'text-green-600' 
                        : growthValue < 0 
                          ? 'text-red-600' 
                          : ''
                    }`}
                  >
                    {formatValue(growthValue, true)}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Other Metrics */}
            {availableMetrics
              .filter(metricId => !['revenue', 'revenueGrowth'].includes(metricId))
              .map((metricId) => (
                <MetricRow
                  key={metricId}
                  metricId={metricId}
                  label={formatMetricLabel(metricId)}
                  values={filteredData.map((row: any) => parseNumber(row[metricId]))}
                  dates={filteredData.map((row: any) => row.date)}
                  isSelected={selectedMetrics.includes(metricId)}
                  onToggle={handleMetricToggle}
                  formatValue={formatValue}
                />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
