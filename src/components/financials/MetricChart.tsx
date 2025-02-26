import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMetricColor, formatYAxis } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart } from "lucide-react";

interface MetricChartProps {
  data: any[];
  metrics: string[];
  ticker?: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
}

export const MetricChart = ({ 
  data, 
  metrics, 
  ticker,
  metricTypes,
  onMetricTypeChange
}: MetricChartProps) => {
  if (!data?.length || !metrics?.length) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px]">
        <p className="text-gray-500">
          {!metrics?.length ? 'Select metrics to visualize' : 'No data available'}
        </p>
      </div>
    );
  }

  // Filter out data points that don't have any values for the selected metrics
  const filteredData = data.filter(item => {
    return metrics.some(metric => {
      return item[metric] !== undefined && item[metric] !== null;
    });
  });

  if (filteredData.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px]">
        <p className="text-gray-500">No data available for the selected metrics</p>
      </div>
    );
  }

  console.log('Chart data after filtering:', filteredData);
  console.log('Selected metrics:', metrics);
  console.log('Metric types:', metricTypes);

  // Helper function to get display name for a metric
  const getMetricDisplayName = (metricId: string): string => {
    // Map of common metric IDs to display names
    const metricNames: Record<string, string> = {
      'revenue': 'Revenue',
      'netIncome': 'Net Income',
      'grossProfit': 'Gross Profit',
      'operatingIncome': 'Operating Income',
      'ebitda': 'EBITDA',
      'eps': 'EPS',
      'totalAssets': 'Total Assets',
      'totalLiabilities': 'Total Liabilities',
      'totalEquity': 'Total Equity',
      'cashAndCashEquivalents': 'Cash & Equivalents',
      'totalDebt': 'Total Debt',
      'netDebt': 'Net Debt',
      'operatingCashFlow': 'Operating Cash Flow',
      'freeCashFlow': 'Free Cash Flow',
      'capitalExpenditure': 'Capital Expenditure',
      'returnOnAssets': 'Return on Assets (ROA)',
      'returnOnEquity': 'Return on Equity (ROE)',
      'profitMargin': 'Profit Margin',
      'operatingMargin': 'Operating Margin',
      'currentRatio': 'Current Ratio',
      'debtToEquity': 'Debt to Equity',
      'debtToAssets': 'Debt to Assets'
    };
    
    // Return mapped name if exists, otherwise format the ID
    return metricNames[metricId] || formatMetricId(metricId);
  };
  
  // Helper function to format metric ID into a display name
  const formatMetricId = (id: string): string => {
    // Replace camelCase with spaces
    let label = id.replace(/([A-Z])/g, ' $1').trim();
    
    // Capitalize first letter of each word
    label = label.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Handle common acronyms
    return label
      .replace(/Ebit/g, 'EBIT')
      .replace(/Ebitda/g, 'EBITDA')
      .replace(/Eps/g, 'EPS')
      .replace(/Roa/g, 'ROA')
      .replace(/Roe/g, 'ROE');
  };

  // Calculate growth rates and CAGR for each metric
  const calculateGrowthRates = (metricName: string) => {
    // Filter out data points where this metric has a value
    const metricData = filteredData
      .filter(item => item[metricName] !== undefined && item[metricName] !== null)
      .sort((a, b) => {
        // Sort by period (newest last for calculation)
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        
        // Handle quarterly format
        if (a.period?.includes('Q') && b.period?.includes('Q')) {
          const [aQ, aYear] = a.period.split(' ');
          const [bQ, bYear] = b.period.split(' ');
          
          if (aYear !== bYear) {
            return parseInt(aYear) - parseInt(bYear);
          }
          return parseInt(aQ.slice(1)) - parseInt(bQ.slice(1));
        }
        
        // Handle annual format
        return parseInt(a.period) - parseInt(b.period);
      });
    
    if (metricData.length < 2) {
      return { totalChange: 'N/A', cagr: 'N/A' };
    }
    
    try {
      const firstValue = metricData[0][metricName];
      const lastValue = metricData[metricData.length - 1][metricName];
      
      if (firstValue === 0 || !firstValue || !lastValue) {
        return { totalChange: 'N/A', cagr: 'N/A' };
      }
      
      // Calculate total change
      const totalChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
      
      // Calculate CAGR
      const periods = metricData.length - 1;
      const years = periods; // Adjust based on period type if needed
      const cagr = years > 0 && firstValue > 0 && lastValue > 0
        ? (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100
        : null;
      
      return {
        totalChange: isNaN(totalChange) ? 'N/A' : `${totalChange.toFixed(2)}%`,
        cagr: cagr === null || isNaN(cagr) ? 'N/A' : `${cagr.toFixed(2)}%`
      };
    } catch (error) {
      console.error(`Error calculating growth rates for ${metricName}:`, error);
      return { totalChange: 'N/A', cagr: 'N/A' };
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {metrics.map((metric) => (
            <div key={metric} className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-md" 
                style={{ backgroundColor: `${getMetricColor(metrics.indexOf(metric))}20` }}
              >
                <span className="font-medium">{getMetricDisplayName(metric)}</span>
                <div className="flex gap-1">
                  <Button
                    variant={metricTypes[metric] === 'bar' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onMetricTypeChange(metric, 'bar')}
                    className="h-8 w-8"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={metricTypes[metric] === 'line' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onMetricTypeChange(metric, 'line')}
                    className="h-8 w-8"
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
              dy={20}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip ticker={ticker} />} />
            
            {metrics.map((metric, index) => {
              const color = getMetricColor(index);
              const displayName = getMetricDisplayName(metric);
              
              if (metricTypes[metric] === 'line') {
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    name={displayName}
                    dot={{ fill: color, r: 4 }}
                    strokeWidth={2}
                    connectNulls={true}
                  />
                );
              }
              return (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={color}
                  name={displayName}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex flex-col gap-2">
          {metrics.map((metric, index) => {
            const { totalChange, cagr } = calculateGrowthRates(metric);
            
            return (
              <div key={metric} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getMetricColor(index) }}
                />
                <span className="text-gray-900 font-medium">
                  {ticker} - {getMetricDisplayName(metric)} {' '}
                  (Total Change: {totalChange}) {' '}
                  (CAGR: {cagr})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};