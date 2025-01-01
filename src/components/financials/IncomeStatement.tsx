import { Table, TableBody } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { IncomeStatementHeader } from "./IncomeStatementHeader";
import { IncomeStatementMetrics } from "./IncomeStatementMetrics";
import { formatMetricLabel, parseNumber } from "./IncomeStatementUtils";
import { INCOME_STATEMENT_METRICS, calculateMetricValue, getMetricDisplayName, formatValue } from "@/utils/metricDefinitions";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const IncomeStatement = ({ 
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

  const ttmData = financialData.find((item: any) => item.period === "TTM");
  const annualData = financialData
    .filter((item: any) => item.period === "FY")
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const combinedData = ttmData ? [ttmData, ...annualData] : annualData;

  const periods = combinedData.map((item: any) => {
    if (item.period === "TTM") return "TTM";
    return new Date(item.date).getFullYear().toString();
  });

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <IncomeStatementHeader periods={periods} />
          <TableBody>
            {INCOME_STATEMENT_METRICS.map((metric) => {
              const values = combinedData.map((current, index) => {
                const previous = combinedData[index + 1];
                
                // Special handling for TTM period
                if (current.period === "TTM") {
                  // For share-related metrics, use the most recent annual value
                  if (metric.format === "shares" || metric.id === "sharesChange") {
                    if (metric.id === "sharesChange") {
                      // For shares change, calculate using annual data only
                      return calculateMetricValue(metric, annualData[0], annualData[1]);
                    }
                    return calculateMetricValue(metric, annualData[0], previous);
                  }
                  
                  // For revenue growth in TTM period
                  if (metric.id === "revenueGrowth") {
                    // Get quarterly data (assuming it's available in the API response)
                    const quarterlyData = financialData
                      .filter((item: any) => item.period === "Q")
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    console.log('Raw quarterly data:', quarterlyData);

                    if (quarterlyData.length >= 8) {
                      // Calculate sum of last 4 quarters
                      const last4Q = quarterlyData.slice(0, 4).reduce((sum: number, q: any) => {
                        console.log('Processing quarter for last4Q:', q);
                        const revenue = q.revenue;
                        console.log('Revenue value:', revenue, 'Type:', typeof revenue);
                        const parsedRevenue = typeof revenue === 'string' 
                          ? parseFloat(revenue.replace(/[^0-9.-]+/g, "")) 
                          : revenue;
                        console.log('Parsed revenue:', parsedRevenue);
                        return sum + (parsedRevenue || 0);
                      }, 0);

                      // Calculate sum of previous 4 quarters
                      const prev4Q = quarterlyData.slice(4, 8).reduce((sum: number, q: any) => {
                        console.log('Processing quarter for prev4Q:', q);
                        const revenue = q.revenue;
                        console.log('Revenue value:', revenue, 'Type:', typeof revenue);
                        const parsedRevenue = typeof revenue === 'string' 
                          ? parseFloat(revenue.replace(/[^0-9.-]+/g, "")) 
                          : revenue;
                        console.log('Parsed revenue:', parsedRevenue);
                        return sum + (parsedRevenue || 0);
                      }, 0);

                      console.log('TTM Revenue calculation:', { 
                        last4Q, 
                        prev4Q,
                        growth: prev4Q > 0 ? ((last4Q - prev4Q) / prev4Q * 100) : 0 
                      });
                      
                      if (prev4Q > 0 && last4Q > 0) {
                        return ((last4Q - prev4Q) / prev4Q * 100);
                      }
                    }
                    
                    // Fallback to annual comparison if quarterly data isn't available
                    console.log('Falling back to annual comparison for revenue growth');
                    return calculateMetricValue(metric, current, previous);
                  }
                }
                
                return calculateMetricValue(metric, current, previous);
              });

              return (
                <IncomeStatementMetrics
                  key={metric.id}
                  metricId={metric.id}
                  label={getMetricDisplayName(metric.id)}
                  values={values.map(v => parseNumber(v))}
                  isSelected={selectedMetrics.includes(metric.id)}
                  onToggle={handleMetricToggle}
                  formatValue={formatValue}
                  isGrowthMetric={metric.format === 'percentage'}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};