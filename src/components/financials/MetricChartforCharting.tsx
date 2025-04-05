import React, { useRef, useMemo, useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, TooltipProps, ReferenceLine, LabelList
} from 'recharts';
import { metricCategories } from '@/data/metricCategories';
import { getMetricDisplayName, getMetricFormat } from '@/utils/metricDefinitions';
import { ChartType } from '@/types/chartTypes';

// Calculate responsive bar sizing based on chart width and data
const calculateResponsiveBarSizing = (containerWidth, dataLength, barMetricCount) => {
  // Calculate available width for bars (subtract margins)
  const availableWidth = containerWidth - 140; // Subtract left and right margins
  
  // Base calculations
  let barCategoryGap = 0;
  let barGap = 0;
  let barSize = 0;
  
  // Minimum spacing between categories
  const minCategoryGap = 20;
  // Maximum percentage of available width to use for category gaps
  const maxCategoryGapPercentage = 0.15;
  
  if (dataLength <= 1) {
    // Special case for single data point
    barCategoryGap = 0;
    barGap = 10;
    barSize = Math.min(200, availableWidth / (barMetricCount || 1));
  } else {
    // For multiple data points
    
    // Calculate base category gap (space between groups of bars)
    barCategoryGap = Math.max(
      minCategoryGap,
      Math.min(
        availableWidth * maxCategoryGapPercentage / (dataLength - 1),
        80 // Cap maximum category gap
      )
    );
    
    // Bar gap is 1/4 of category gap
    barGap = barCategoryGap / 4;
    
    // Calculate how much width is available for actual bars
    // Available width minus all gaps between categories
    const categoryGapsTotal = barCategoryGap * (dataLength - 1);
    // Minus all gaps between bars within categories (for multiple metrics)
    const barGapsTotal = barMetricCount > 1 ? barGap * (barMetricCount - 1) * dataLength : 0;
    
    const availableBarSpace = availableWidth - categoryGapsTotal - barGapsTotal;
    
    // Calculate bar size based on available space and total number of bars
    barSize = Math.max(10, availableBarSpace / (dataLength * barMetricCount));
    
    // Cap bar size to reasonable maximum
    barSize = Math.min(barSize, 200);
  }
  
  return {
    barSize: Math.floor(barSize),
    barGap: Math.floor(barGap),
    barCategoryGap: Math.floor(barCategoryGap)
  };
};

// Calculate responsive typography based on container width
const calculateResponsiveTypography = (containerWidth) => {
  // Base sizes for a reference width (e.g., 1000px wide container)
  const baseWidth = 1000;
  
  // Base font sizes
  const baseTitleSize = 18;
  const baseSubtitleSize = 14;
  const baseLegendSize = 12;
  const baseLabelSize = 11;
  const baseTickSize = 10;
  const baseTooltipSize = 12;
  
  // Calculate scaling factor based on current width vs base width
  // Using a sqrt to make scaling less aggressive (more balanced)
  const scaleFactor = Math.sqrt(containerWidth / baseWidth);
  
  // Calculate new sizes with constraints to prevent too small or too large fonts
  const titleSize = Math.max(14, Math.min(24, Math.round(baseTitleSize * scaleFactor)));
  const subtitleSize = Math.max(12, Math.min(18, Math.round(baseSubtitleSize * scaleFactor)));
  const legendSize = Math.max(10, Math.min(16, Math.round(baseLegendSize * scaleFactor)));
  const labelSize = Math.max(8, Math.min(14, Math.round(baseLabelSize * scaleFactor)));
  const tickSize = Math.max(8, Math.min(12, Math.round(baseTickSize * scaleFactor)));
  const tooltipSize = Math.max(10, Math.min(14, Math.round(baseTooltipSize * scaleFactor)));
  
  return {
    titleSize,
    subtitleSize,
    legendSize,
    labelSize,
    tickSize,
    tooltipSize,
    iconSize: Math.max(8, Math.min(16, Math.round(10 * scaleFactor))) // Legend icon size
  };
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, fontSize }: TooltipProps<number, string> & { fontSize: number }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  return (
    <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md" style={{ fontSize: `${fontSize}px` }}>
      <p className="font-medium text-gray-800">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry, index) => {
          let formattedValue = entry.value as number;
          let suffix = '';
          
          // Check if this is a percentage metric (use the payload's metadata)
          const isPercentage = entry.payload?.isPercentage?.[entry.dataKey] || 
                              (String(entry.name).toLowerCase().includes('percent') || 
                               String(entry.name).toLowerCase().includes('margin'));
          
          if (isPercentage) {
            // Format as percentage
            formattedValue = +(formattedValue).toFixed(2);
            suffix = '%';
          } else if (Math.abs(formattedValue) >= 1e9) {
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
const formatValue = (value: number, isPercentage: boolean = false): string => {
  if (isPercentage) {
    return `${value.toFixed(2)}%`;
  } else if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

// Helper to get a display name for metrics (used for tooltip and legend)
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

// Format primary Y-axis values
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

// Format secondary Y-axis values (percentages)
const formatPercentageYAxis = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Check if a metric name suggests it's a percentage
const isPercentageMetric = (metricId: string): boolean => {
  const lowerMetricId = metricId.toLowerCase();
  return lowerMetricId.includes('percent') || 
         lowerMetricId.includes('margin') || 
         lowerMetricId.includes('ratio') ||
         lowerMetricId.includes('growth') ||
         lowerMetricId.includes('rate');
};

// Calculate CAGR - Compound Annual Growth Rate
const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100);
};

interface MetricChartProps {
  data: any[]; // Your processed data array
  metrics: string[]; // Array of metric IDs
  ticker: string;
  metricTypes: Record<string, ChartType>;
  stackedMetrics?: string[]; // New prop for metrics that should be stacked
  onMetricTypeChange: (metric: string, type: ChartType) => void;
  companyName?: string;
  title?: string; // Optional custom title
  metricSettings?: Record<string, {
    average?: boolean;
    median?: boolean;
    min?: boolean;
    max?: boolean;
  }>;
  metricLabels?: Record<string, boolean>; // Control data label visibility
  directLegends?: string[]; // Pass pre-formatted legend texts directly

}

export const MetricChart: React.FC<MetricChartProps> = ({ 
  data, 
  metrics, 
  ticker,
  metricTypes,
  stackedMetrics = [],
  onMetricTypeChange,
  companyName,
  title,
  metricSettings = {},
  metricLabels = {}, // Default all labels visible
  directLegends
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // State for responsive sizing
  const [chartDimensions, setChartDimensions] = useState({
    barSize: 30,
    barGap: 4,
    barCategoryGap: 20
  });
  
  // State for responsive typography
  const [typography, setTypography] = useState({
    titleSize: 18,
    subtitleSize: 14,
    legendSize: 12,
    labelSize: 11,
    tickSize: 10,
    tooltipSize: 12,
    iconSize: 14
  });
  
  // Console logs for debugging
  console.log("MetricSettings received:", metricSettings);
  console.log("MetricLabels received:", metricLabels);
  console.log("StackedMetrics received:", stackedMetrics);
  
  // Split metrics by chart type for proper rendering order
  const lineMetrics = metrics.filter(metric => metricTypes[metric] === 'line');
  
  // For bar metrics, we now need to handle both regular and stacked bars
  const barMetrics = metrics.filter(metric => {
    // Include both 'bar' type and 'stacked' type that aren't in stackedMetrics (not enough to stack)
    return metricTypes[metric] === 'bar' || 
          (metricTypes[metric] === 'stacked' && stackedMetrics.length < 2);
  });
  
  // Get metrics that should be rendered as stacked bars
  const effectiveStackedMetrics = stackedMetrics.length >= 2 ? stackedMetrics : [];
  
  // Identify percentage metrics for secondary Y-axis
  const percentageMetrics = metrics.filter(metric => isPercentageMetric(metric));
  const normalMetrics = metrics.filter(metric => !isPercentageMetric(metric));
  
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
  
  // Update dimensions and typography when component mounts, window resizes, or data changes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const containerWidth = chartRef.current.offsetWidth;
        
        // Calculate bar metrics count for sizing
        const barMetricCount = barMetrics.length + (effectiveStackedMetrics.length > 0 ? 1 : 0);
        
        // Update bar sizing
        const barSizing = calculateResponsiveBarSizing(
          containerWidth,
          data?.length || 0,
          barMetricCount
        );
        
        // Update typography
        const typo = calculateResponsiveTypography(containerWidth);
        
        setChartDimensions(barSizing);
        setTypography(typo);
      }
    };
    
    // Initial calculation
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, [data, barMetrics.length, effectiveStackedMetrics.length]);
  
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
    
    // Add axis indicator for dual-axis chart
    if (percentageMetrics.includes(value) && percentageMetrics.length > 0 && normalMetrics.length > 0) {
      result += ' (right axis)';
    } else if (normalMetrics.includes(value) && percentageMetrics.length > 0 && normalMetrics.length > 0) {
      result += ' (left axis)';
    }
    
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
    if (isPercentageMetric(value)) {
      unit = '(%)';
    } else if (value === 'revenue' || value === 'netIncome' || value.includes('liabilities')) {
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
    
    // Return the text
    return result;
  };
  const getSubtitle = () => {
    // If directLegends are provided, extract just the metric portions for the subtitle
    if (directLegends && directLegends.length > 0) {
      // Extract just the metric name portion from each legend
      // Typically formats are like "AAPL - Revenue (Millions) (Total Change: X%) (CAGR: Y%)"
      // We want to extract just "Revenue" parts
      const extractedNames = directLegends.map(legend => {
        // Extract the part after " - " and before any parentheses
        const match = legend.match(/- ([^(]+)/);
        return match ? match[1].trim() : legend;
      });
      
      // Remove duplicates (same metric name might appear for different companies)
      const uniqueNames = [...new Set(extractedNames)];
      return uniqueNames.join(', ');
    }
    
    // Default behavior - use local metric display names
    const metricNames = metrics.map(metricId => getLocalMetricDisplayName(metricId));
    return metricNames.join(', ');
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
      const isPercent = isPercentageMetric(metricId);
      
      // Determine which axis to use for reference lines
      // If only percentage metrics, everything goes on normal axis
      // If dual axes, put percentages on percentage axis
      const axisId = needsDualAxes && isPercent ? "percentage" : "normal";
      
      // Helper to add a reference line with proper styling
      const addReferenceLine = (value: number, label: string, dash: string = '3 3') => {
        // Format the value with appropriate abbreviation
        const formattedValue = formatValue(value, isPercent);
        
        referenceLines.push(
          <ReferenceLine 
            key={`${metricId}-${label}`}
            y={value} 
            stroke={color} 
            strokeWidth={1.5}
            strokeDasharray={dash}
            ifOverflow="extendDomain"
            yAxisId={axisId}
            label={{
              value: `${label}:${formattedValue}`,
              position: 'insideBottomRight',
              fill: "black",
              fontSize: typography.labelSize,
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
    return formatValue(Number(value), false);
  };
  
  // Format percentage data label
  const formatPercentageDataLabel = (value: any) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    return formatValue(Number(value), true);
  };
  
  // The common data accessor function for chart components
  const getDataAccessor = (metric: string) => {
    return (entry: any) => {
      const foundMetric = entry.metrics?.find((m: any) => m.name === metric);
      return foundMetric ? foundMetric.value : null;
    };
  };

  // Get domain for percentage axis
  const getPercentageDomain = () => {
    // If no percentage metrics, return default range
    if (percentageMetrics.length === 0) return [0, 100];
    
    // Find min and max values for all percentage metrics
    let min = Infinity;
    let max = -Infinity;
    
    data.forEach(entry => {
      percentageMetrics.forEach(metric => {
        let value;
        if (entry.metrics) {
          const metricData = entry.metrics.find(m => m.name === metric);
          value = metricData ? parseFloat(metricData.value) : null;
        } else {
          value = entry[metric] !== undefined ? parseFloat(entry[metric]) : null;
        }
        
        if (value !== null && !isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    // If no valid data found, return default
    if (min === Infinity || max === -Infinity) return [0, 100];
    
    // Add padding (10% of the range)
    const range = max - min;
    const padding = range * 0.1;
    
    return [Math.max(0, min - padding), max + padding];
  };

  // Calculate if we need dual axes (if we have both percentage and non-percentage metrics)
  const needsDualAxes = percentageMetrics.length > 0 && normalMetrics.length > 0;

  // Add metadata to data for tooltip
  const enhancedData = useMemo(() => {
    return data.map(item => {
      // Create shallow copy of the item
      const enhancedItem = { ...item };
      
      // Add isPercentage map to help tooltip
      enhancedItem.isPercentage = {};
      
      if (item.metrics) {
        item.metrics.forEach(metric => {
          enhancedItem.isPercentage[metric.name] = isPercentageMetric(metric.name);
        });
      } else {
        // For flattened data structure
        metrics.forEach(metricId => {
          if (item[metricId] !== undefined) {
            enhancedItem.isPercentage[metricId] = isPercentageMetric(metricId);
          }
        });
      }
      
      return enhancedItem;
    });
  }, [data, metrics]);

  return (
    <div className="h-full flex flex-col relative" ref={chartRef}>
      {/* Chart Title - This will be visible in the PNG export */}
      <div className="text-center mb-2">
        <h3 style={{ fontSize: `${typography.titleSize}px` }} className="font-medium text-gray-800">
          {chartTitle}
        </h3>
        <p style={{ fontSize: `${typography.subtitleSize}px` }} className="text-gray-500">
        {getSubtitle()}
        </p>
        {needsDualAxes && (
          <p style={{ fontSize: `${typography.subtitleSize - 2}px` }} className="text-blue-600 mt-1">
            Dual Y-axes: Left axis (regular values) | Right axis (percentages)
          </p>
        )}
        {effectiveStackedMetrics.length > 0 && (
          <p style={{ fontSize: `${typography.subtitleSize - 2}px` }} className="text-blue-600 mt-1">
            Showing stacked bars for: {effectiveStackedMetrics.map(m => getLocalMetricDisplayName(m)).join(', ')}
          </p>
        )}
      </div>
      
      <div className="flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={enhancedData}
            margin={{ 
              top: 20, 
              right: needsDualAxes ? 60 : 10, // Add more right margin for dual axes
              left: 1, 
              bottom: 20 + (typography.legendSize - 12) * 5 // Adjust bottom margin based on legend size
            }}
            barGap={chartDimensions.barGap}
            barCategoryGap={chartDimensions.barCategoryGap}
          >
            <CartesianGrid stroke="#e0e0e0" strokeWidth={0.1} />
            <XAxis 
              dataKey="period" 
              angle={0} 
              textAnchor="end" 
              height={60}
              tickMargin={10}
              stroke="#666"
              strokeWidth={1}
              tick={{ fontSize: typography.tickSize }}
            />
            
            {/* Primary Y-axis - shows either normal values or percentages depending on what's selected */}
            <YAxis 
              axisLine={false}
              tickFormatter={normalMetrics.length > 0 ? formatYAxis : formatPercentageYAxis}
              tick={{ fontSize: typography.tickSize }}
              yAxisId="normal"
              orientation="left"
              domain={normalMetrics.length > 0 ? undefined : getPercentageDomain()}
            />
            
            {/* Secondary Y-axis for percentages (only render if both types of metrics are present) */}
            {needsDualAxes && (
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                axisLine={false}
                tickFormatter={formatPercentageYAxis}
                tick={{ fontSize: typography.tickSize }}
                domain={getPercentageDomain()}
              />
            )}
            
            <Tooltip content={<CustomTooltip fontSize={typography.tooltipSize} />} />
            <Legend 
              formatter={(value, entry, index) => {
                return (
                  <span style={{ fontSize: `${typography.legendSize}px`, color: '#000000' }}>
                    {directLegends && index !== undefined && index < directLegends.length ? 
                      directLegends[index] : 
                      legendFormatter(value)}
                  </span>
                );
  }}
              wrapperStyle={{ 
                paddingTop: 0,
                left: 30,
                bottom: 30 + (typography.legendSize - 12) * 3 // Adjust based on font size
              }}
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={typography.iconSize}
            />
            
            {/* Reference line at y=0 if any metrics might have negative values */}
            <ReferenceLine y={0} stroke="#777" strokeDasharray="3 3" yAxisId="normal" />
            
            {/* Render Stacked BAR metrics first (if any) */}
            {effectiveStackedMetrics.length >= 2 && effectiveStackedMetrics.map((metric, index) => {
              const color = colorMap[metric];
              const showLabels = metricLabels[metric] !== false;
              const dataAccessor = getDataAccessor(metric);
              const isPercent = isPercentageMetric(metric);
              
              // If only percentage metrics exist, everything goes on the "normal" axis
              // If dual axes, then percentages go on "percentage" axis
              const axisId = needsDualAxes && isPercent ? "percentage" : "normal";

              return (
                <Bar 
                  key={metric} 
                  dataKey={dataAccessor}
                  name={metric}
                  fill={color}
                  stackId="stack1"
                  barSize={chartDimensions.barSize}
                  zIndex={1} // Ensure bars have lower z-index
                  yAxisId={axisId}
                >
                  {/* Conditionally add labels if enabled */}
                  {showLabels && (
                    <LabelList 
                      dataKey={dataAccessor}
                      position="inside"
                      fill="#ffffff"
                      fontSize={typography.labelSize}
                      formatter={isPercent ? formatPercentageDataLabel : formatDataLabel}
                    />
                  )}
                </Bar>
              );
            })}

            {/* Render regular BAR metrics (non-stacked) */}
            {barMetrics.map((metric) => {
              const color = colorMap[metric];
              const showLabels = metricLabels[metric] !== false;
              const dataAccessor = getDataAccessor(metric);
              const isPercent = isPercentageMetric(metric);
              
              // If only percentage metrics exist, everything goes on the "normal" axis
              // If dual axes, then percentages go on "percentage" axis
              const axisId = needsDualAxes && isPercent ? "percentage" : "normal";
              
              return (
                <Bar 
                  key={metric} 
                  dataKey={dataAccessor}
                  name={metric}
                  fill={color}
                  barSize={chartDimensions.barSize}
                  zIndex={1} // Ensure bars have lower z-index
                  yAxisId={axisId}
                >
                  {/* Conditionally add labels if enabled */}
                  {showLabels && (
                    <LabelList 
                      dataKey={dataAccessor}
                      position="top"
                      fill={"black"}
                      fontSize={typography.labelSize}
                      formatter={isPercent ? formatPercentageDataLabel : formatDataLabel}
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
              const isPercent = isPercentageMetric(metric);
              
              // If only percentage metrics exist, everything goes on the "normal" axis
              // If dual axes, then percentages go on "percentage" axis
              const axisId = needsDualAxes && isPercent ? "percentage" : "normal";
              
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
                  yAxisId={axisId}
                >
                  {/* Conditionally add labels if enabled */}
                  {showLabels && (
                    <LabelList 
                      dataKey={dataAccessor}
                      position="top"
                      fill={"black"}
                      fontSize={typography.labelSize}
                      formatter={isPercent ? formatPercentageDataLabel : formatDataLabel}
                    />
                  )}
                </Line>
              );
            })}
            
            {renderReferenceLines()}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;