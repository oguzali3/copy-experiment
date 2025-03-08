import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { IncomeStatementLoading } from "./IncomeStatementLoading";
import { IncomeStatementError } from "./IncomeStatementError";
import { ConsistentFinancialDataTable } from "./ConsistentFinancialDataTable";
import { useMemo } from "react";

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
  // Always fetch quarterly data if timeFrame is ttm
  const period = timeFrame === 'quarterly' || timeFrame === 'ttm' ? 'quarter' : 'annual';
  
  // Fetch the quarterly data for TTM
  const { data: quarterlyData, isLoading: isQuarterlyLoading, error: quarterlyError } = useQuery({
    queryKey: ['income-statement', ticker, 'quarter'],
    queryFn: () => fetchFinancialData('income-statement', ticker, 'quarter'),
    enabled: !!ticker && (timeFrame === 'quarterly' || timeFrame === 'ttm'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch annual data for comparisons in TTM calculations
  const { data: annualData, isLoading: isAnnualLoading, error: annualError } = useQuery({
    queryKey: ['income-statement', ticker, 'annual'],
    queryFn: () => fetchFinancialData('income-statement', ticker, 'annual'),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Only use this for the annual view
  const { data: financialData, isLoading: isFinancialLoading, error: financialError } = useQuery({
    queryKey: ['income-statement', ticker, period],
    queryFn: () => fetchFinancialData('income-statement', ticker, period),
    enabled: !!ticker && timeFrame === 'annual', // Only fetch this if we're in annual view
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  // Combine and process the data based on the timeFrame
  const { processedData, processedPeriods, processedAnnualData, isLoading, error } = useMemo(() => {
    if (timeFrame === 'annual') {
      // For annual view, use the financialData directly
      if (isFinancialLoading) return { isLoading: true, error: null, processedData: [], processedPeriods: [], processedAnnualData: [] };
      if (financialError) return { isLoading: false, error: financialError, processedData: [], processedPeriods: [], processedAnnualData: [] };
      if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
        return { isLoading: false, error: new Error(`No financial data for ${ticker}`), processedData: [], processedPeriods: [], processedAnnualData: [] };
      }

      // Sort by date in descending order
      const sortedData = [...financialData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Create the period labels
      const periods = sortedData.map((item) => new Date(item.date).getFullYear().toString());
      
      return { 
        processedData: sortedData, 
        processedPeriods: periods, 
        processedAnnualData: sortedData,
        isLoading: false, 
        error: null 
      };
    } 
    else if (timeFrame === 'quarterly') {
      // For quarterly view, use the quarterlyData
      if (isQuarterlyLoading || isAnnualLoading) return { isLoading: true, error: null, processedData: [], processedPeriods: [], processedAnnualData: [] };
      if (quarterlyError) return { isLoading: false, error: quarterlyError, processedData: [], processedPeriods: [], processedAnnualData: [] };
      if (!quarterlyData || !Array.isArray(quarterlyData) || quarterlyData.length === 0) {
        return { isLoading: false, error: new Error(`No quarterly data for ${ticker}`), processedData: [], processedPeriods: [], processedAnnualData: [] };
      }
      console.log('Income Statement quarterly ham:', quarterlyData);

      // Sort the quarterly data, ensuring TTM is first
      const sortedQuarterlyData = [...quarterlyData].sort((a, b) => {
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Sort the annual data for correct TTM calculations
      const sortedAnnualData = annualData && Array.isArray(annualData) && annualData.length > 0
        ? [...annualData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];

      // Create period labels
      const periods = sortedQuarterlyData.map((item) => {
        if (item.period === 'TTM') return 'TTM';
        
        const dateObj = new Date(item.date);
        const month = dateObj.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        const year = dateObj.getFullYear();
        
        return `Q${quarter} ${year}`;
      });
      console.log('Income Statement quarterly:', sortedQuarterlyData);

      return { 
        processedData: sortedQuarterlyData.slice(0, 60), 
        processedPeriods: periods.slice(0, 60), 
        processedAnnualData: sortedAnnualData,
        isLoading: false, 
        error: null 
      };
    }
    else if (timeFrame === 'ttm') {
      // For TTM view, combine TTM and annual data
      if (isQuarterlyLoading || isAnnualLoading) return { isLoading: true, error: null, processedData: [], processedPeriods: [], processedAnnualData: [] };
      if (quarterlyError) return { isLoading: false, error: quarterlyError, processedData: [], processedPeriods: [], processedAnnualData: [] };
      if (!quarterlyData || !Array.isArray(quarterlyData) || quarterlyData.length === 0) {
        return { isLoading: false, error: new Error(`No quarterly data for ${ticker}`), processedData: [], processedPeriods: [], processedAnnualData: [] };
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

      // Create period labels (TTM first, then annual years)
      const periods = combinedData.map((item, index) => {
        if (item.period === 'TTM') return 'TTM';
        return new Date(item.date).getFullYear().toString();
      });

      return { 
        processedData: combinedData, 
        processedPeriods: periods, 
        processedAnnualData: sortedAnnualData,
        isLoading: false, 
        error: null 
      };
    }

    return { isLoading: false, error: null, processedData: [], processedPeriods: [], processedAnnualData: [] };
  }, [timeFrame, quarterlyData, annualData, financialData, isQuarterlyLoading, isAnnualLoading, isFinancialLoading, quarterlyError, annualError, financialError, ticker]);

  if (isLoading) {
    return <IncomeStatementLoading />;
  }

  if (error) {
    return <IncomeStatementError error={error as Error} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <ConsistentFinancialDataTable
          combinedData={processedData}
          periods={processedPeriods}
          selectedMetrics={selectedMetrics}
          onMetricToggle={handleMetricToggle}
          annualData={processedAnnualData}
        />
      </div>
    </div>
  );
};