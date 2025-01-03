import React from 'react';
import { MetricChart } from "@/components/financials/MetricChart";
import { MetricsDataTable } from "@/components/financials/MetricsDataTable";
import { TimeRangeSelector } from "./TimeRangeSelector";

interface ChartingContentProps {
  selectedCompany: any;
  selectedMetrics: string[];
  financialData: any[];
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricRemove: (metric: string) => void;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  timeRange: [number, number];
  onTimeRangeChange: (range: [number, number]) => void;
}

export const ChartingContent = ({
  selectedCompany,
  selectedMetrics,
  financialData,
  metricTypes,
  onMetricRemove,
  onMetricTypeChange,
  timeRange,
  onTimeRangeChange,
}: ChartingContentProps) => {
  if (!selectedCompany && !selectedMetrics.length) {
    return (
      <div className="text-center text-gray-500">
        <p>Select a company and metrics to start charting</p>
      </div>
    );
  }

  const filteredData = financialData?.filter((item: any) => {
    const year = parseInt(item.period);
    return !isNaN(year) && year >= timeRange[0] && year <= timeRange[1];
  });

  return (
    <div className="space-y-6">
      {selectedCompany && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{selectedCompany.name}</p>
            <p className="text-sm text-gray-500">
              {selectedCompany.symbol} • {selectedCompany.exchangeShortName}
            </p>
          </div>
        </div>
      )}

      {selectedMetrics.length > 0 && (
        <>
          <div className="flex gap-2 flex-wrap">
            {selectedMetrics.map((metric) => (
              <div
                key={metric}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{metric}</span>
                <button
                  onClick={() => onMetricRemove(metric)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <TimeRangeSelector
            startYear={2015}
            endYear={2023}
            selectedRange={timeRange}
            onRangeChange={onTimeRangeChange}
          />

          <div className="h-[500px]">
            <MetricChart
              data={filteredData}
              metrics={selectedMetrics}
              ticker={selectedCompany.symbol}
              metricTypes={metricTypes}
              onMetricTypeChange={onMetricTypeChange}
            />
          </div>

          <MetricsDataTable
            data={filteredData}
            metrics={selectedMetrics}
            ticker={selectedCompany.symbol}
          />
        </>
      )}
    </div>
  );
};