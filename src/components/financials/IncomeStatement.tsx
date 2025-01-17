import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { IncomeStatementHeader } from "./IncomeStatementHeader";
import { IncomeStatementLoading } from "./IncomeStatementLoading";
import { IncomeStatementError } from "./IncomeStatementError";
import { IncomeStatementMetrics } from "./IncomeStatementMetrics";
import { MetricsChartSection } from "./MetricsChartSection";
import { TimeFrameSelector } from "./TimeFrameSelector";
import { useMetrics } from "@/hooks/useMetrics";
import { INCOME_STATEMENT_METRICS } from "@/utils/metricDefinitions";

interface IncomeStatementProps {
  ticker: string;
}

export const IncomeStatement = ({ ticker }: IncomeStatementProps) => {
  const [timeframe, setTimeframe] = useState<"annual" | "quarterly">("annual");
  const {
    selectedMetrics,
    setSelectedMetrics,
    metricTypes,
    handleMetricTypeChange,
    getMetricData,
  } = useMetrics(ticker);

  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['income-statement', ticker, timeframe],
    queryFn: async () => {
      console.log('Fetching income statement data:', { ticker, timeframe });
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'income-statement', symbol: ticker, period: timeframe }
      });
      
      if (error) throw error;
      console.log('Income statement data received:', data?.length, 'periods');
      return data;
    },
    enabled: !!ticker
  });

  const formatChartData = (data: any[]) => {
    if (!data) return [];

    return data.map((item: any) => {
      const formattedItem: any = {
        period: timeframe === "annual" ? item.calendar_year : getQuarterLabel(item.date, item.calendar_year),
      };

      // Add selected metrics to the formatted item
      selectedMetrics.forEach((metric) => {
        const metricDef = INCOME_STATEMENT_METRICS.find((m) => m.id === metric);
        if (metricDef) {
          formattedItem[metric] = item[metricDef.key];
        }
      });

      return formattedItem;
    }).reverse(); // Reverse to show oldest to newest
  };

  const getQuarterLabel = (dateStr: string, year: number) => {
    const dateObj = new Date(dateStr);
    const month = dateObj.getMonth();
    const quarter = Math.floor(month / 3) + 1;

    // Get current date for comparison
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

    // Company-specific adjustments
    const companyAdjustments: Record<string, { date: string; quarter: number; year: number }> = {
      'NVDA': { date: '2023-11-21', quarter: 3, year: 2024 },
      // Add more companies as needed with their latest reporting dates
    };

    // Check if we have specific handling for this company
    if (companyAdjustments[ticker]) {
      const { date: latestReportDate, quarter: latestQuarter, year: latestYear } = companyAdjustments[ticker];
      if (dateObj > new Date(latestReportDate)) {
        console.log(`Adjusting ${ticker} quarter to latest reported:`, {
          from: `Q${quarter} ${year}`,
          to: `Q${latestQuarter} ${latestYear}`
        });
        return `Q${latestQuarter} ${latestYear}`;
      }
    }

    // General future date prevention
    if (year > currentYear || (year === currentYear && quarter > currentQuarter)) {
      console.log(`Preventing future quarter display for ${ticker}:`, {
        from: `Q${quarter} ${year}`,
        to: `Q${currentQuarter} ${currentYear}`
      });
      return `Q${currentQuarter} ${currentYear}`;
    }
    
    return `Q${quarter} ${year}`;
  };

  if (isLoading) return <IncomeStatementLoading />;
  if (error) return <IncomeStatementError error={error} />;
  if (!financialData) return null;

  const chartData = formatChartData(financialData);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <IncomeStatementHeader
            ticker={ticker}
            metrics={INCOME_STATEMENT_METRICS}
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
          />
          <TimeFrameSelector
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
          <IncomeStatementMetrics
            data={financialData}
            metrics={INCOME_STATEMENT_METRICS}
            selectedMetrics={selectedMetrics}
            timeframe={timeframe}
          />
        </div>
      </Card>

      <MetricsChartSection
        selectedMetrics={selectedMetrics}
        data={chartData}
        ticker={ticker}
        metricTypes={metricTypes}
        onMetricTypeChange={handleMetricTypeChange}
      />
    </div>
  );
};