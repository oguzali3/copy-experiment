import React from 'react';
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { PlusCircle } from "lucide-react";

interface FinancialDataTableProps {
  data: any[];
  metrics: string[];
  metricVisibility: Record<string, boolean>;
  company?: string;
  formatValue?: (value: number) => string;
}

export const FinancialDataTable: React.FC<FinancialDataTableProps> = ({
  data,
  metrics,
  metricVisibility,
  company = '',
  formatValue = (value) => value.toLocaleString()
}) => {
  // Filter to only visible metrics
  const visibleMetrics = metrics.filter(metric => metricVisibility[metric] !== false);
  
  if (!data || data.length === 0 || visibleMetrics.length === 0) {
    return null;
  }

  // Sort data chronologically (oldest to newest)
  const sortedData = [...data].sort((a, b) => {
    // Handle TTM as the most recent
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    
    // Try to parse as years for annual data
    const yearA = parseInt(a.period);
    const yearB = parseInt(b.period);
    
    if (!isNaN(yearA) && !isNaN(yearB)) {
      return yearA - yearB;
    }
    
    // For quarterly data with format like "Mar 23"
    try {
      const [monthA, yearA] = a.period.split(' ');
      const [monthB, yearB] = b.period.split(' ');
      
      // Compare years first
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      
      // If years are the same, compare months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthA) - months.indexOf(monthB);
    } catch (e) {
      // Fallback to string comparison
      return a.period.localeCompare(b.period);
    }
  });

  // Format a value for display with appropriate suffix (B, M, K)
  const formatDisplayValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '-';
    }
    
    const num = Number(value);
    
    if (Math.abs(num) >= 1e9) {
      return `${(num / 1e9).toFixed(3)}B`;
    } else if (Math.abs(num) >= 1e6) {
      return `${(num / 1e6).toFixed(3)}M`;
    } else if (Math.abs(num) >= 1e3) {
      return `${(num / 1e3).toFixed(3)}K`;
    }
    return num.toFixed(3);
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {/* Fixed-width column for metric names */}
            <th className="px-3 py-2 text-left font-medium text-gray-500 border-b border-r border-gray-200" style={{ width: '250px', minWidth: '250px' }}>
              Metric
            </th>
            {/* Equal width columns for each period */}
            {sortedData.map((dataPoint) => (
              <th 
                key={dataPoint.period} 
                className="px-3 py-2 text-right font-medium text-gray-500 border-b border-gray-200" 
                style={{ width: `${100 / sortedData.length}%` }}
              >
                {dataPoint.period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleMetrics.map((metric, idx) => (
            <tr 
              key={metric} 
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-3 py-2 text-left font-medium text-gray-800 border-r border-gray-200" style={{ width: '250px', minWidth: '250px' }}>
                <div className="flex items-center">
                  <PlusCircle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {company ? `${company} - ` : ''}{getMetricDisplayName(metric)}
                  </span>
                </div>
              </td>
              {sortedData.map((dataPoint) => {
                // Find the metric value in this data point
                let value = null;
                
                if (dataPoint.metrics) {
                  const metricData = dataPoint.metrics.find((m: any) => m.name === metric);
                  if (metricData) {
                    value = metricData.value;
                  }
                } else if (dataPoint[metric] !== undefined) {
                  value = dataPoint[metric];
                }
                
                return (
                  <td 
                    key={`${dataPoint.period}-${metric}`} 
                    className="px-3 py-2 text-right font-medium text-gray-600 border-gray-100"
                    style={{ width: `${100 / sortedData.length}%` }}
                  >
                    {formatDisplayValue(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialDataTable;