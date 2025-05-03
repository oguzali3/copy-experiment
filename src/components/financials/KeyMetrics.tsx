import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { KeyMetricsTable } from "./KeyMetricsTable";
import { useMemo } from "react";

interface KeyMetricsProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  ticker: string;
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const KeyMetrics = ({ 
  timeFrame,
  ticker,
  selectedMetrics,
  onMetricsChange
}: KeyMetricsProps) => {
  // Fetch quarterly data if timeFrame is quarterly or ttm
  const { data: quarterlyData, isLoading: isQuarterlyLoading, error: quarterlyError } = useQuery({
    queryKey: ['key-metrics', ticker, 'quarter'],
    queryFn: () => fetchFinancialData('key-metrics', ticker, 'quarter'),
    enabled: !!ticker && (timeFrame === 'quarterly' || timeFrame === 'ttm'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch annual data for comparisons
  const { data: annualData, isLoading: isAnnualLoading, error: annualError } = useQuery({
    queryKey: ['key-metrics', ticker, 'annual'],
    queryFn: () => fetchFinancialData('key-metrics', ticker, 'annual'),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  // Process and combine data based on timeFrame
  const { processedData, isLoading, error } = useMemo(() => {
    if (timeFrame === 'annual') {
      if (isAnnualLoading) return { isLoading: true, error: null, processedData: [] };
      if (annualError) return { isLoading: false, error: annualError, processedData: [] };
      if (!annualData || !Array.isArray(annualData) || annualData.length === 0) {
        return { isLoading: false, error: new Error(`No annual key metrics data for ${ticker}`), processedData: [] };
      }

      // Sort annual data
      const sortedData = [...annualData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return { 
        processedData: sortedData,
        isLoading: false, 
        error: null 
      };
    } 
    else if (timeFrame === 'quarterly') {
      if (isQuarterlyLoading) return { isLoading: true, error: null, processedData: [] };
      if (quarterlyError) return { isLoading: false, error: quarterlyError, processedData: [] };
      if (!quarterlyData || !Array.isArray(quarterlyData) || quarterlyData.length === 0) {
        return { isLoading: false, error: new Error(`No quarterly key metrics data for ${ticker}`), processedData: [] };
      }

      // Sort quarterly data ensuring TTM comes first
      const sortedData = [...quarterlyData].sort((a, b) => {
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return { 
        processedData: sortedData.slice(0, 60),
        isLoading: false, 
        error: null 
      };
    }
    else if (timeFrame === 'ttm') {
      // For TTM view, combine TTM and annual data
      if (isQuarterlyLoading || isAnnualLoading) return { isLoading: true, error: null, processedData: [] };
      if (quarterlyError || annualError) return { isLoading: false, error: quarterlyError || annualError, processedData: [] };
      
      // Check quarterly data
      if (!quarterlyData || !Array.isArray(quarterlyData) || quarterlyData.length === 0) {
        return { isLoading: false, error: new Error(`No quarterly key metrics data for ${ticker}`), processedData: [] };
      }

      // Find TTM data
      const ttmData = quarterlyData.find(item => item.period === 'TTM');
      
      // Sort annual data
      const sortedAnnualData = annualData && Array.isArray(annualData) && annualData.length > 0
        ? [...annualData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];

      // Combine TTM with annual data
      const combinedData = ttmData
        ? [ttmData, ...sortedAnnualData.slice(0, 9)] // TTM first, then up to 9 years of annual data
        : sortedAnnualData.slice(0, 10);

      return { 
        processedData: combinedData,
        isLoading: false, 
        error: null 
      };
    }

    return { isLoading: false, error: null, processedData: [] };
  }, [timeFrame, quarterlyData, annualData, isQuarterlyLoading, isAnnualLoading, quarterlyError, annualError, ticker]);

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

  if (error || !processedData || processedData.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error ? (error as Error).message : `No key metrics data available for ${ticker}.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <KeyMetricsTable 
        data={processedData}
        ticker={ticker}
        selectedMetrics={selectedMetrics}
        onMetricToggle={handleMetricToggle}
        timeFrame={timeFrame}
      />
    </div>
  );
};