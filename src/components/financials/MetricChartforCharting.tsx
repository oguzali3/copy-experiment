// Calculate CAGR - Compound Annual Growth Rate
const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
    if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
    return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100);
  };
  
  import React, { useRef, useMemo } from 'react';
  import { 
    ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, TooltipProps, ReferenceLine, LabelList
  } from 'recharts';
  import { metricCategories } from '@/data/metricCategories';
  import { getMetricDisplayName, getMetricFormat } from '@/utils/metricDefinitions';
  
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
            
            // Get the proper display name for the metric using the same approach as legend
            let displayName;
            try {
              // First check if we can use name property directly
              const metricId = String(entry.name || '');
              
              // Try through the utilities first
              displayName = getLocalMetricDisplayName(metricId);
              
              // If display name is same as ID (lookup failed), apply same formatting as legend
              if (displayName === metricId) {
                displayName = formatRawMetricId(metricId);
              }
            } catch (error) {
              // Last resort fallback
              displayName = formatRawMetricId(String(entry.name || 'Unknown'));
            }
            
            return (
              <p 
                key={`tooltip-${index}`} 
                style={{ color: entry.color as string }}
                className="flex justify-between gap-4"
              >
                <span>{displayName}: </span>
                <span className="font-semibold">{formattedValue}{suffix}</span>
              </p>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Helper function to format raw IDs into display names
  const formatRawMetricId = (id: string): string => {
    if (!id) return 'Unknown Metric';
    
    return id
      // Handle camelCase by adding space before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize the first letter
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  // Helper to format values for data labels and reference lines
  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };
  
  interface MetricChartProps {
    data: any[]; // Your processed data array
    metrics: string[]; // Array of metric IDs
    ticker: string;
    metricTypes: Record<string, 'bar' | 'line'>;
    onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
    companyName?: string;
    title?: string; // Optional custom title
    metricSettings?: Record<string, {
      average?: boolean;
      median?: boolean;
      min?: boolean;
      max?: boolean;
    }>;
    metricLabels?: Record<string, boolean>; // Control data label visibility
  }
  
  export const MetricChart: React.FC<MetricChartProps> = ({ 
    data, 
    metrics, 
    ticker,
    metricTypes,
    onMetricTypeChange,
    companyName,
    title,
    metricSettings = {},
    metricLabels = {} // Default all labels visible
  }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    
    // Console logs for debugging
    console.log("MetricSettings received:", metricSettings);
    console.log("MetricLabels received:", metricLabels);
    
    // Split metrics by chart type for proper rendering order
    const barMetrics = metrics.filter(metric => (metricTypes[metric] || 'bar') === 'bar');
    const lineMetrics = metrics.filter(metric => metricTypes[metric] === 'line');
    
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
    
    // Get readable metric names - use from metricCategories if needed as fallback
    const getLocalMetricDisplayName = (metricId: string): string => {
      try {
        // First try to get the name from metricDefinitions
        // Make sure metricId is a string to avoid "replace is not a function" error
        if (typeof metricId !== 'string') {
          console.warn(`Invalid metric ID type: ${typeof metricId}`);
          return String(metricId || '');
        }
        
        const displayName = getMetricDisplayName(metricId);
        
        // If we got back the same ID, try from categories
        if (displayName === metricId) {
          for (const category of metricCategories) {
            const metric = category.metrics.find(m => m.id === metricId);
            if (metric) return metric.name;
          }
        }
        
        return displayName;
      } catch (error) {
        console.error(`Error getting display name for metric: ${metricId}`, error);
        // Fallback to raw ID with formatting
        return metricId.charAt(0).toUpperCase() + metricId.slice(1).replace(/([A-Z])/g, ' $1');
      }
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
    
    // Calculate metrics stats for total change and CAGR
    const metricsStats = useMemo(() => {
      if (!data || !data.length || !metrics.length) return {};
      
      const stats: Record<string, { totalChange: number | null; cagr: number | null }> = {};
      
      metrics.forEach(metric => {
        // Extract the data points for this metric across all periods
        const metricDataPoints = data
          .map(entry => {
            const metricData = entry.metrics ? 
              entry.metrics.find((m: any) => m.name === metric) : null;
            
            if (metricData) {
              // If using the original data structure with metrics array
              return {
                period: entry.period,
                value: typeof metricData.value === 'number' ? 
                  metricData.value : parseFloat(metricData.value)
              };
            } else if (entry[metric] !== undefined) {
              // If using flattened data structure
              return {
                period: entry.period,
                value: typeof entry[metric] === 'number' ? 
                  entry[metric] : parseFloat(entry[metric])
              };
            }
            return null;
          })
          .filter(point => point && !isNaN(point.value)) as { period: string; value: number }[];
        
        if (metricDataPoints.length >= 2) {
          // Sort by period (assuming periods can be compared as strings)
          metricDataPoints.sort((a, b) => {
            // Try to parse as years first
            const yearA = parseInt(a.period);
            const yearB = parseInt(b.period);
            
            if (!isNaN(yearA) && !isNaN(yearB)) {
              return yearA - yearB;
            }
            
            // If not years, try to compare as strings
            return a.period.localeCompare(b.period);
          });
          
          // Calculate total change
          const startValue = metricDataPoints[0].value;
          const endValue = metricDataPoints[metricDataPoints.length - 1].value;
          
          // Avoid division by zero
          const totalChange = startValue !== 0 ? 
            ((endValue - startValue) / Math.abs(startValue)) * 100 : null;
          
          // Calculate years for CAGR
          let years = metricDataPoints.length - 1; // Default to number of periods - 1
          
          // If periods are years, calculate actual years elapsed
          if (!isNaN(parseInt(metricDataPoints[0].period)) && 
              !isNaN(parseInt(metricDataPoints[metricDataPoints.length - 1].period))) {
            years = parseInt(metricDataPoints[metricDataPoints.length - 1].period) - 
                    parseInt(metricDataPoints[0].period);
          }
          
          // Calculate CAGR only for positive values
          const cagr = (startValue > 0 && endValue > 0 && years > 0) ? 
            calculateCAGR(startValue, endValue, years) : null;
          
          stats[metric] = { totalChange, cagr };
        } else {
          stats[metric] = { totalChange: null, cagr: null };
        }
      });
      
      return stats;
    }, [data, metrics]);
    
    // Calculate statistics for each metric (average, median, min, max)
    const metricStatValues = useMemo(() => {
      const stats: Record<string, {
        average?: number;
        median?: number;
        min?: number;
        max?: number;
      }> = {};
      
      // Only process if we have data, metrics, and settings
      if (!data?.length || !metrics?.length) return stats;
      
      metrics.forEach(metricId => {
        // Skip if no settings enabled for this metric
        const settings = metricSettings[metricId];
        if (!settings) return;
        
        // Only proceed if any statistic is enabled
        if (settings.average || settings.median || settings.min || settings.max) {
          // Extract values for this metric
          const values: number[] = [];
          
          data.forEach(item => {
            let metricValue = null;
            
            // Handle both data structures (nested metrics array or flat)
            if (item.metrics) {
              const metricItem = item.metrics.find(m => m.name === metricId);
              if (metricItem) metricValue = metricItem.value;
            } else if (item[metricId] !== undefined) {
              metricValue = item[metricId];
            }
            
            if (metricValue !== null && metricValue !== undefined && !isNaN(metricValue)) {
              values.push(typeof metricValue === 'number' ? metricValue : parseFloat(metricValue));
            }
          });
          
          // Skip if no valid values found
          if (values.length === 0) return;
          
          stats[metricId] = {};
          
          // Calculate statistics
          if (settings.average) {
            stats[metricId].average = values.reduce((sum, val) => sum + val, 0) / values.length;
          }
          
          if (settings.median || settings.min || settings.max) {
            const sortedValues = [...values].sort((a, b) => a - b);
            
            if (settings.min) {
              stats[metricId].min = sortedValues[0];
            }
            
            if (settings.max) {
              stats[metricId].max = sortedValues[sortedValues.length - 1];
            }
            
            if (settings.median) {
              const mid = Math.floor(sortedValues.length / 2);
              stats[metricId].median = sortedValues.length % 2 === 0
                ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
                : sortedValues[mid];
            }
          }
        }
      });
      
      console.log("Calculated metric statistics:", stats);
      return stats;
    }, [data, metrics, metricSettings]);
    
    // Custom legend formatter with total change and CAGR
    const legendFormatter = (value: string) => {
      const stats = metricsStats[value];
      
      // Get proper display name for the metric
      let displayName = getLocalMetricDisplayName(value);
      
      // If display name is still the same as raw ID, try to format it better
      if (displayName === value) {
        displayName = formatRawMetricId(value);
      }
      
      let result = `${ticker} - ${displayName}`;
      
      // Determine if the metric is quarterly or annual
      const frequency = 
        data && data.length > 0 && data[0].period ? 
        (data[0].period.toLowerCase().includes('q') ? '(Quarterly)' : '') : 
        '';
      
      if (frequency) {
        result += ` ${frequency}`;
      }
      
      // Get the unit for display (Millions, etc.)
      let unit = '';
      if (value === 'revenue' || value === 'netIncome' || value.includes('liabilities')) {
        unit = '(Millions)';
      }
      
      if (unit) {
        result += ` ${unit}`;
      }
      
      // Add total change if available
      if (stats && stats.totalChange !== null) {
        result += ` (Total Change: ${stats.totalChange.toFixed(2)}%)`;
      }
      
      // Add CAGR if available
      if (stats && stats.cagr !== null) {
        result += ` (CAGR: ${stats.cagr.toFixed(2)}%)`;
      }
      
      // Return the text without applying color
      return <span style={{ color: '#000000' }}>{result}</span>;
    };
  
    // Get metric display names for the subtitle
    const metricNames = metrics.map(metricId => getLocalMetricDisplayName(metricId));
    const metricsSubtitle = metricNames.join(', ');
  
    // Generate reference lines for statistics
    const renderReferenceLines = () => {
      const referenceLines = [];
      
      console.log("Generating reference lines for metrics:", metrics);
      
      metrics.forEach(metricId => {
        const stats = metricStatValues[metricId];
        if (!stats) {
          console.log(`No stats found for metric: ${metricId}`);
          return;
        }
        
        console.log(`Adding reference lines for: ${metricId}`, stats);
        
        const color = colorMap[metricId];
        
        // Helper to add a reference line with proper styling
        const addReferenceLine = (value: number, label: string, dash: string = '3 3') => {
          // Format the value with appropriate abbreviation
          const formattedValue = formatValue(value);
          
          referenceLines.push(
            <ReferenceLine 
              key={`${metricId}-${label}`}
              y={value} 
              stroke={color} 
              strokeWidth={1.5}
              strokeDasharray={dash}
              ifOverflow="extendDomain"
              label={{
                value: `${label}:${formattedValue}`,
                position: 'right',
                fill: color,
                fontSize: 10,
                offset: 5
              }} 
              style={{ zIndex: 1000 }}
            />
          );
        };
        
        // Add reference lines for each enabled statistic
        if (stats.average !== undefined) {
          addReferenceLine(stats.average, 'Avg');
        }
        
        if (stats.median !== undefined) {
          addReferenceLine(stats.median, 'Median', '5 5');
        }
        
        if (stats.min !== undefined) {
          addReferenceLine(stats.min, 'Min', '2 2');
        }
        
        if (stats.max !== undefined) {
          addReferenceLine(stats.max, 'Max', '2 2');
        }
      });
      
      console.log("Reference lines created:", referenceLines.length);
      return referenceLines;
    };
  
    // Format data label value to be consistent with chart formatting
    const formatDataLabel = (value: any) => {
      if (value === null || value === undefined || isNaN(value)) {
        return '';
      }
      return formatValue(Number(value));
    };
  
    // Calculate optimal bar size based on data length
    const calculateBarSize = () => {
      if (!data) return 30; // Default size
      
      const barMetricsCount = barMetrics.length;
      
      // Calculate total number of bars (data points × number of bar metrics)
      const totalBars = data.length * barMetricsCount;
      if (totalBars <= 6) return 200; // Very thick for 1-3 data points
      if (totalBars <= 12) return 130; // Very thick for 1-3 data points
      if (totalBars <= 20) return 70; // Thick for 4-5 data points
      if (totalBars <= 35) return 40; // Medium for 6-8 data points
      if (totalBars <= 45) return 30; // Thinner for 9-12 data points
      return 25; // Very thin for 13+ data points
    };
    
    // The common data accessor function for chart components
    const getDataAccessor = (metric: string) => {
      return (entry: any) => {
        const foundMetric = entry.metrics?.find((m: any) => m.name === metric);
        return foundMetric ? foundMetric.value : null;
      };
    };
  
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
              margin={{ top: 20, right: 120, left: 20, bottom: 120 }}
              barGap={10} // Increase space between bars in the same category
              barCategoryGap={200}
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
                formatter={legendFormatter}
                wrapperStyle={{ 
                  paddingTop: 10,
                  left: 70,
                  bottom: 100
                }}
                layout="vertical"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={12}
              />
              
              {/* Reference line at y=0 if any metrics might have negative values */}
              <ReferenceLine y={0} stroke="#777" strokeDasharray="3 3" />
              
              {/* Statistical reference lines */}
              {renderReferenceLines()}
              
              {/* Render BAR metrics first (lower z-index) */}
              {barMetrics.map((metric) => {
                const color = colorMap[metric];
                const showLabels = metricLabels[metric] !== false;
                const barSize = calculateBarSize();
                const dataAccessor = getDataAccessor(metric);
                
                return (
                  <Bar 
                    key={metric} 
                    dataKey={dataAccessor}
                    name={metric}
                    fill={color}
                    barSize={barSize}
                    zIndex={1} // Ensure bars have lower z-index
                  >
                    {/* Conditionally add labels if enabled */}
                    {showLabels && (
                      <LabelList 
                        dataKey={dataAccessor}
                        position="top"
                        fill={"black"}
                        fontSize={12}
                        formatter={formatDataLabel}
                      />
                    )}
                  </Bar>
                );
              })}
              
              {/* Render LINE metrics second (higher z-index) */}
              {lineMetrics.map((metric) => {
                const color = colorMap[metric];
                const showLabels = metricLabels[metric] !== false;
                const dataAccessor = getDataAccessor(metric);
                
                return (
                  <Line 
                    key={metric} 
                    type="linear" 
                    dataKey={dataAccessor}
                    name={metric}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    zIndex={10} // Ensure lines have higher z-index
                  >
                    {/* Conditionally add labels if enabled */}
                    {showLabels && (
                      <LabelList 
                        dataKey={dataAccessor}
                        position="top"
                        fill={"black"}
                        fontSize={12}
                        formatter={formatDataLabel}
                      />
                    )}
                  </Line>
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Logo in the bottom right corner with text */}
          <div className="absolute bottom-0 right-0 flex items-center">
            <p className="text-gray-600 font-medium mr-2">Powered by</p>
            <img 
              src="/mngrlogo.png" 
              alt="MNGR Logo" 
              className="h-32 w-auto" 
              style={{ opacity: 0.8 }}
            />
          </div>
        </div>
      </div>
    );
  };
  
  export default MetricChart;