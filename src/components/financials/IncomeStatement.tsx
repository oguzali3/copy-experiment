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
                
                if (current.period === "TTM") {
                  if (metric.format === "shares" || metric.id === "sharesChange") {
                    if (metric.id === "sharesChange") {
                      return calculateMetricValue(metric, annualData[0], annualData[1]);
                    }
                    return calculateMetricValue(metric, annualData[0], previous);
                  }
                  
                  if (metric.id === "revenueGrowth") {
                    const quarterlyData = financialData
                      .filter((item: any) => item.period === "Q")
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    console.log('Processing quarterly data:', quarterlyData);

                    if (quarterlyData.length >= 8) {
                      const lastFourQuarters = quarterlyData.slice(0, 4);
                      const lastFourQuartersRevenue = lastFourQuarters.reduce((sum, quarter) => {
                        const revenue = parseFloat(String(quarter.revenue).replace(/[^0-9.-]+/g, ""));
                        console.log(`Last 4Q - Quarter ${quarter.date} revenue:`, revenue);
                        return sum + revenue;
                      }, 0);

                      const priorFourQuarters = quarterlyData.slice(4, 8);
                      const priorFourQuartersRevenue = priorFourQuarters.reduce((sum, quarter) => {
                        const revenue = parseFloat(String(quarter.revenue).replace(/[^0-9.-]+/g, ""));
                        console.log(`Prior 4Q - Quarter ${quarter.date} revenue:`, revenue);
                        return sum + revenue;
                      }, 0);

                      console.log('TTM Revenue calculation:', {
                        lastFourQuartersRevenue,
                        priorFourQuartersRevenue
                      });

                      if (priorFourQuartersRevenue > 0) {
                        // Get the most recent fiscal year revenue
                        const mostRecentAnnualRevenue = parseFloat(String(annualData[0].revenue).replace(/[^0-9.-]+/g, ""));
                        console.log('Most recent annual revenue:', mostRecentAnnualRevenue);
                        console.log('Last four quarters revenue:', lastFourQuartersRevenue);
                        
                        // Use annual growth rate if TTM revenue is within 1% of fiscal year revenue
                        const revenueDiff = Math.abs(lastFourQuartersRevenue - mostRecentAnnualRevenue);
                        const threshold = mostRecentAnnualRevenue * 0.01; // 1% of annual revenue
                        
                        if (revenueDiff <= threshold) {
                          console.log('Using annual growth rate as TTM revenue is within 1% of fiscal year revenue');
                          return calculateMetricValue(metric, annualData[0], annualData[1]);
                        }

                        const growth = ((lastFourQuartersRevenue - priorFourQuartersRevenue) / priorFourQuartersRevenue) * 100;
                        console.log('Final TTM Revenue Growth:', growth);
                        return growth;
                      }
                    }
                    
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