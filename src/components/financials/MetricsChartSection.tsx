
import { Card } from "@/components/ui/card";
import { MetricChart } from "./MetricChart";
import { TimeRangePanel } from "./TimeRangePanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getMetricDisplayName } from "@/utils/metricDefinitions";

interface MetricsChartSectionProps {
  selectedMetrics: string[];
  data: any[];
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  timePeriods?: string[];
  sliderValue?: number[];
  onSliderChange?: (value: number[]) => void;
  startDate?: string;
  endDate?: string;
  onRemoveMetric?: (metricId: string) => void;
  timeFrame?: "annual" | "quarterly" | "ttm";
}

export const MetricsChartSection = ({
  selectedMetrics,
  data,
  ticker,
  metricTypes,
  onMetricTypeChange,
  timePeriods = [],
  sliderValue,
  onSliderChange,
  startDate,
  endDate,
  onRemoveMetric,
  timeFrame = "annual"
}: MetricsChartSectionProps) => {
  if (selectedMetrics.length === 0) {
    return null;
  }

  // Group metrics by type for better organization
  const metricGroups = {
    income: selectedMetrics.filter(m => 
      m.includes('revenue') || 
      m.includes('profit') || 
      m.includes('income') || 
      m.includes('eps') || 
      m.includes('ebitda')
    ),
    balance: selectedMetrics.filter(m => 
      m.includes('asset') || 
      m.includes('liability') || 
      m.includes('equity') || 
      m.includes('cash') || 
      m.includes('debt')
    ),
    cashflow: selectedMetrics.filter(m => 
      m.includes('cashFlow') || 
      m.includes('dividend') || 
      m.includes('capex')
    ),
    ratios: selectedMetrics.filter(m => 
      m.includes('ratio') || 
      m.includes('margin') || 
      m.includes('return') || 
      m.includes('growth')
    ),
    other: selectedMetrics.filter(m => 
      !m.includes('revenue') && 
      !m.includes('profit') && 
      !m.includes('income') && 
      !m.includes('eps') &&
      !m.includes('ebitda') &&
      !m.includes('asset') && 
      !m.includes('liability') && 
      !m.includes('equity') && 
      !m.includes('cash') && 
      !m.includes('debt') &&
      !m.includes('cashFlow') && 
      !m.includes('dividend') && 
      !m.includes('capex') &&
      !m.includes('ratio') && 
      !m.includes('margin') && 
      !m.includes('return') && 
      !m.includes('growth')
    )
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Selected Metrics</h2>
        
        {/* Display selected metrics as badges with remove option */}
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedMetrics.map(metricId => (
            <Badge 
              key={metricId} 
              variant="secondary"
              className="pl-2 py-1 flex items-center gap-1"
            >
              {getMetricDisplayName(metricId)}
              {onRemoveMetric && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 ml-1"
                  onClick={() => onRemoveMetric(metricId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      </div>
      
      <MetricChart 
        data={data}
        metrics={selectedMetrics}
        ticker={ticker}
        metricTypes={metricTypes}
        onMetricTypeChange={onMetricTypeChange}
      />
      
      {/* Add TimeRangePanel below the chart, only when metrics are selected */}
      {selectedMetrics.length > 0 && timePeriods.length > 0 && (
        <TimeRangePanel
          startDate={startDate}
          endDate={endDate}
          sliderValue={sliderValue}
          onSliderChange={onSliderChange}
          timePeriods={timePeriods}
          timeFrame={timeFrame}
        />
      )}
    </Card>
  );
};
