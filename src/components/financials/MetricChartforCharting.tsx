import React, { useRef } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, TooltipProps
} from 'recharts';
import { metricCategories } from '@/data/metricCategories';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  
  return (
    <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
      <p className="font-medium text-gray-800">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry, index) => {
          let formattedValue = entry.value as number;
          let suffix = '';
          
          if (Math.abs(formattedValue) >= 1e9) {
            formattedValue = +(formattedValue / 1e9).toFixed(2);
            suffix = 'B';
          } else if (Math.abs(formattedValue) >= 1e6) {
            formattedValue = +(formattedValue / 1e6).toFixed(2);
            suffix = 'M';
          } else if (Math.abs(formattedValue) >= 1e3) {
            formattedValue = +(formattedValue / 1e3).toFixed(2);
            suffix = 'K';
          } else {
            formattedValue = +formattedValue.toFixed(2);
          }
          
          return (
            <p 
              key={`tooltip-${index}`} 
              style={{ color: entry.color as string }}
              className="flex justify-between gap-4"
            >
              <span>{entry.name}: </span>
              <span className="font-semibold">{formattedValue}{suffix}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
};

interface MetricChartProps {
  data: any[]; // Your processed data array
  metrics: string[]; // Array of metric IDs
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  companyName?: string;
  title?: string; // Optional custom title
}

export const MetricChart: React.FC<MetricChartProps> = ({ 
  data, 
  metrics, 
  ticker,
  metricTypes,
  onMetricTypeChange,
  companyName,
  title
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Generate default title if none provided
  const chartTitle = title || `${companyName || ticker} - Financial Metrics`;
  
  // Generate colors for each metric
  const colorMap: Record<string, string> = {};
  const baseColors = [
    '#2563eb', '#db2777', '#16a34a', '#ea580c', '#8b5cf6', 
    '#0891b2', '#4338ca', '#b91c1c', '#4d7c0f', '#6d28d9'
  ];
  
  metrics.forEach((metric, index) => {
    colorMap[metric] = baseColors[index % baseColors.length];
  });
  
  // Get readable metric names instead of keys
  const getMetricDisplayName = (metricId: string): string => {
    for (const category of metricCategories) {
      const metric = category.metrics.find(m => m.id === metricId);
      if (metric) return metric.name;
    }
    return metricId;
  };
  
  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    } else if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  // Get metric display names for the subtitle
  const metricNames = metrics.map(metricId => getMetricDisplayName(metricId));
  const metricsSubtitle = metricNames.join(', ');

  return (
    <div className="h-full flex flex-col relative" ref={chartRef}>
      {/* Chart Title - This will be visible in the PNG export */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium text-gray-800">{chartTitle}</h3>
        <p className="text-sm text-gray-500">{metricsSubtitle}</p>
      </div>
      
      <div className="flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tickMargin={10}
            />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => getMetricDisplayName(value)}
              wrapperStyle={{ paddingTop: 10 }}
            />
            
            {/* Render each metric */}
            {metrics.map((metric) => {
              // Determine if this metric should be a bar or line
              const chartType = metricTypes[metric] || 'bar';
              
              // Create the appropriate chart element
              return chartType === 'bar' ? (
                <Bar 
                  key={metric} 
                  dataKey={(entry) => {
                    const foundMetric = entry.metrics.find(m => m.name === metric);
                    return foundMetric ? foundMetric.value : null;
                  }}
                  name={metric}
                  fill={colorMap[metric]}
                  barSize={30}
                />
              ) : (
                <Line 
                  key={metric} 
                  type="monotone" 
                  dataKey={(entry) => {
                    const foundMetric = entry.metrics.find(m => m.name === metric);
                    return foundMetric ? foundMetric.value : null;
                  }}
                  name={metric}
                  stroke={colorMap[metric]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Logo in the bottom right corner with text */}
        <div className="absolute bottom-2 right-2 flex items-center">
          <p className="text-gray-600 font-medium mr-2">Powered by</p>
          <img 
            src="/mngrlogo.png" 
            alt="MNGR Logo" 
            className="h-24 w-auto" 
            style={{ opacity: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricChart;