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
// Enhanced CustomTooltip component that shows both financial metrics and price data
const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  fontSize,
  data,                   // Add the financial data array
  processedPriceData,     // Add the price data array
  colorMap,               // Add color map for consistent colors
  metrics                 // Add metrics for proper display names
}: TooltipProps<number, string> & { 
  fontSize: number,
  data: any[],
  processedPriceData: any[],
  colorMap: Record<string, string>,
  metrics: string[]
}) => {
  if (!active || !payload || payload.length === 0) return null;
  
  // Determine if we're hovering over a price point or a financial data point
  // Price data has dates with hyphens (e.g., "2022-03-15"), financial data doesn't
  const isHoveringOverPrice = label && typeof label === 'string' && label.includes('-');
  
  // Format the label display
  let displayLabel = label;
  if (isHoveringOverPrice) {
    try {
      const date = new Date(label);
      displayLabel = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      // In case of parsing error, use the label as is
      displayLabel = label;
    }
  }
  
  // Prepare the tooltip entries
  // Start with whatever payload is already active
  const tooltipEntries = [...payload];
  
  // Now add any missing data
  if (isHoveringOverPrice) {
    // If hovering over price, we're already showing price data
    // No need to do anything special here, as price is already in the payload
  } else {
    // If hovering over financial data, find and add the nearest price point
    // Only add price if it's one of the selected metrics and not already in payload
    const priceMetric = metrics.find(m => m.toLowerCase() === 'price');
    const hasPriceInPayload = tooltipEntries.some(entry => entry.name?.toLowerCase() === 'price');
    
    if (priceMetric && !hasPriceInPayload && processedPriceData.length > 0) {
      // Extract year from financial data label
      const year = parseInt(label);
      
      if (!isNaN(year)) {
        // Find price data points for this year
        const pricePointsInYear = processedPriceData.filter(point => {
          try {
            const pointDate = new Date(point.time);
            return pointDate.getFullYear() === year;
          } catch (e) {
            return false;
          }
        });
        
        // If we have price data for this year, use the middle point or calculate average
        if (pricePointsInYear.length > 0) {
          // Use the middle point as representative or fall back to average
          const midIndex = Math.floor(pricePointsInYear.length / 2);
          const representativePrice = pricePointsInYear[midIndex]?.price || 
            (pricePointsInYear.reduce((sum, p) => sum + p.price, 0) / pricePointsInYear.length);
          
          // Add to tooltip entries
          tooltipEntries.push({
            name: priceMetric,
            value: representativePrice,
            color: colorMap[priceMetric] || '#ff7300',
            // Add dataKey for correct formatting
            dataKey: 'price'
          });
        }
      }
    }
  }
  
  return (
    <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md" style={{ fontSize: `${fontSize}px` }}>
      <p className="font-medium text-gray-800">{displayLabel}</p>
      <div className="mt-2 space-y-1">
        {tooltipEntries.map((entry, index) => {
          // Skip empty values
          if (entry.value === null || entry.value === undefined) return null;
          
          let formattedValue = entry.value as number;
          let suffix = '';
          
          // Check if this is a price value
          const isPrice = String(entry.name).toLowerCase().includes('price');
          
          // Check if this is a percentage metric
          const isPercentage = entry.payload?.isPercentage?.[entry.dataKey] || 
                              (String(entry.name).toLowerCase().includes('percent') || 
                               String(entry.name).toLowerCase().includes('margin'));
          
          if (isPrice) {
            // Format as price
            formattedValue = +(formattedValue).toFixed(2);
            suffix = '';
          } else if (isPercentage) {
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
          
          // Get the proper display name for the metric
          let displayName;
          try {
            // First check if we can use name property directly
            const metricId = String(entry.name || '');
            
            // Handle special case for price values
            if (isPrice) {
              displayName = 'Price';
            } else {
              // Try through the utilities first
              displayName = getLocalMetricDisplayName(metricId);
              
              // If display name is same as ID (lookup failed), apply same formatting as legend
              if (displayName === metricId) {
                displayName = formatRawMetricId(metricId);
              }
            }
          } catch (error) {
            // Last resort fallback
            displayName = formatRawMetricId(String(entry.name || 'Unknown'));
          }
          
          // For price, format as currency
          const formattedDisplay = isPrice 
            ? `${formattedValue.toFixed(2)}` 
            : `${formattedValue}${suffix}`;
          
          return (
            <p 
              key={`tooltip-${index}`} 
              style={{ color: entry.color as string }}
              className="flex justify-between gap-4"
            >
              <span>{displayName}: </span>
              <span className="font-semibold">{formattedDisplay}</span>
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

// Format price Y-axis values
const formatPriceYAxis = (value: number) => {
  return `$${value.toFixed(2)}`;
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

// Check if a metric is a price metric
const isPriceMetric = (metricId: string): boolean => {
  return metricId.toLowerCase() === 'price';
};
const isMcapMetric = (metricId: string): boolean => {
  return metricId.toLowerCase() === 'marketcapdaily';
};
// Calculate CAGR - Compound Annual Growth Rate
const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100);
};

interface StatisticReferenceLine {
  companyTicker: string;
  metricId: string;
  statType: 'average' | 'median' | 'min' | 'max';
  value: number;
}

// Interface for daily price data
interface DailyPricePoint {
  time: string;
  price: number;
}
interface MarketDataPoint {
  time: string;
  [key: string]: any; // This allows for any market data metric (price, peRatio, etc.)
}

interface MetricChartProps {
  data: any[]; // Your processed data array
  metrics: string[]; // Array of metric IDs
  ticker: string;
  metricTypes: Record<string, ChartType>;
  stackedMetrics?: string[]; // New prop for metrics that should be stacked
  onMetricTypeChange: (metric: string, type: ChartType) => void;
  companyName?: string;
  labelVisibilityArray?: boolean[]; // New prop: array of visibility flags
  title?: string; // Optional custom title
  metricSettings?: Record<string, {
    average?: boolean;
    median?: boolean;
    min?: boolean;
    max?: boolean;
  }>;
  metricLabels?: Record<string, boolean>; // Control data label visibility
  directLegends?: string[]; // Pass pre-formatted legend texts directly
  statisticalLines?: StatisticReferenceLine[]; // New prop
  // Add daily price data property
  dailyPriceData?: DailyPricePoint[];
  dailyMarketData?: Record<string, MarketDataPoint[]>; //
  selectedPeriods?: string[]; // Add this new prop for selected time periods
  sliderValue?: [number, number];
  timePeriods?: string[];
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
  labelVisibilityArray = [], // Default to empty array
  directLegends,
  statisticalLines = [], // Default to empty array
  dailyPriceData = [], // Default to empty array
  dailyMarketData = {}, // New prop with default empty object

  selectedPeriods = [],
  sliderValue = [0, 0],
  timePeriods = []
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
  
  // Check if we have daily price data
  const hasPriceData = dailyPriceData && dailyPriceData.length > 0;
  
  // Check if we have a price metric
  const hasPriceMetric = metrics.some(m => isPriceMetric(m));
  
  // Split metrics by chart type for proper rendering order
  const lineMetrics = metrics.filter(metric => metricTypes[metric] === 'line' || isPriceMetric(metric));
  const isMarketDataMetric = (metricId: string): boolean => {
    return metricId.toLowerCase() === 'price' || 
           metricId.toLowerCase() === 'marketcapdaily' ||
           metricId.toLowerCase() === 'peratiodaily' ||
           metricId.toLowerCase() === 'psratiodaily' ||
           metricId.toLowerCase() === 'pfcfratiodaily' ||
           metricId.toLowerCase() === 'pcfratiodaily' ||
           metricId.toLowerCase() === 'pbratiodaily' ||
           metricId.toLowerCase() === 'fcfyielddaily';
  };
  // For bar metrics, we now need to handle both regular and stacked bars
  const barMetrics = metrics.filter(metric => {
    // Exclude price metric from bar metrics
    if (isMarketDataMetric(metric)) return false;
    
    // Include both 'bar' type and 'stacked' type that aren't in stackedMetrics (not enough to stack)
    return metricTypes[metric] === 'bar' || 
          (metricTypes[metric] === 'stacked' && stackedMetrics.length < 2);
  });
  
  // Get metrics that should be rendered as stacked bars
  const effectiveStackedMetrics = stackedMetrics.length >= 2 ? stackedMetrics : [];

  // Identify percentage metrics for secondary Y-axis
  const percentageMetrics = metrics.filter(metric => isPercentageMetric(metric));
  const normalMetrics = metrics.filter(metric => !isPercentageMetric(metric) && !isPriceMetric(metric));
  const priceMetrics = metrics.filter(metric => isPriceMetric(metric));
  const McapMetric = metrics.filter(metric => isMcapMetric(metric));

  const marketDataMetrics = metrics.filter(metric => isMarketDataMetric(metric));

  // Generate default title if none provided
  const chartTitle = title || `${companyName || ticker} - Financial Metrics`;
  
  // Generate colors for each metric
  const colorMap: Record<string, string> = {};
  const baseColors = [
    '#2563eb', '#db2777', '#16a34a', '#ea580c', '#8b5cf6', 
    '#0891b2', '#4338ca', '#b91c1c', '#4d7c0f', '#6d28d9'
  ];
  
  metrics.forEach((metric, index) => {
    // Use orange for price metric, otherwise use the standard color palette
    if (isPriceMetric(metric)) {
      colorMap[metric] = '#ff7300'; // Distinct orange for price data
    } else {
      colorMap[metric] = baseColors[index % baseColors.length];
    }
  });

  // Process daily price data for chart rendering
  const processedPriceData = useMemo(() => {
    if (!hasPriceData || !hasPriceMetric) return [];
    
    // Add a period property that matches our financial data X-axis
    return dailyPriceData.map(point => ({
      ...point,
      period: point.time // Important: Use period as key to match financial data's x-axis
    }));
  }, [dailyPriceData, hasPriceMetric, hasPriceData]);
  
  // Update dimensions and typography when component mounts, window resizes, or data changes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const containerWidth = chartRef.current.offsetWidth;
        
        // Calculate bar metrics count for sizing
        const barMetricCount = barMetrics.length + (effectiveStackedMetrics.length > 0 ? 1 : 0);
        
        // Update bar sizing - importantly, use data.length, not dailyPriceData.length
        const barSizing = calculateResponsiveBarSizing(
          containerWidth,
          data.length, // Use financial data length only
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
  }, [data.length, barMetrics.length, effectiveStackedMetrics.length]);
  // Check if a metric is a market data metric


// Process all market data for chart rendering
const processedMarketData = useMemo(() => {
  const result: Record<string, any[]> = {};
  
  // Process regular price data for backward compatibility
  if (hasPriceMetric && dailyPriceData.length > 0) {
    result.price = dailyPriceData.map(point => ({
      ...point,
      period: point.time // Important: Use period as key to match financial data's x-axis
    }));
  }
  
  // Process all other market data metrics
  Object.entries(dailyMarketData).forEach(([metricId, dataPoints]) => {
    if (dataPoints && dataPoints.length > 0) {
      result[metricId] = dataPoints.map(point => ({
        ...point,
        period: point.time // Add period key for consistency
      }));
    }
  });
  
  return result;
}, [dailyPriceData, dailyMarketData, hasPriceMetric]);
  // Calculate metrics stats for total change and CAGR
  const metricsStats = useMemo(() => {
    if (!data || !data.length || !metrics.length) return {};
    
    const stats: Record<string, { totalChange: number | null; cagr: number | null }> = {};
    
    metrics.forEach(metric => {
      // Skip price metric from stats calculations
      if (isPriceMetric(metric)) return;
      
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
      // Skip price metric for these calculations
      if (isPriceMetric(metricId)) return;
      
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
    
    return stats;
  }, [data, metrics, metricSettings]);
  
  const getSelectedPeriodsFromTimeRange = useMemo(() => {
    if (!timePeriods || !sliderValue) return [];
    
    // Get the periods within the slider range
    const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
    return selectedPeriods;
  }, [timePeriods, sliderValue]);
  // Function to get filtered market data for a specific metric
const getFilteredMarketData = (metricId: string) => {
  if (!processedMarketData[metricId] || processedMarketData[metricId].length === 0) {
    return [];
  }
  
  // Create a date range from selectedPeriods
  let startDate = null;
  let endDate = null;
  
  // Process the selectedPeriods to determine date range
  selectedPeriods.forEach(period => {
    // Try to parse as a year (like "2021")
    const yearMatch = parseInt(period);
    if (!isNaN(yearMatch)) {
      const periodStart = new Date(yearMatch, 0, 1); // Jan 1
      const periodEnd = new Date(yearMatch, 11, 31); // Dec 31
      
      if (!startDate || periodStart < startDate) startDate = periodStart;
      if (!endDate || periodEnd > endDate) endDate = periodEnd;
    } else {
      // Try to extract a year from other formats (like "Q1 2021")
      const yearExtract = period.match(/\b(20\d{2})\b/);
      if (yearExtract) {
        const year = parseInt(yearExtract[1]);
        
        // For quarters, extract the quarter number
        const quarterMatch = period.match(/Q(\d)/i);
        if (quarterMatch) {
          const quarter = parseInt(quarterMatch[1]);
          const startMonth = (quarter - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
          const endMonth = startMonth + 2; // Last month of quarter
          
          const periodStart = new Date(year, startMonth, 1);
          const periodEnd = new Date(year, endMonth, 31);
          
          if (!startDate || periodStart < startDate) startDate = periodStart;
          if (!endDate || periodEnd > endDate) endDate = periodEnd;
        } else {
          // If we just have a year, use the whole year
          const periodStart = new Date(year, 0, 1);
          const periodEnd = new Date(year, 11, 31);
          
          if (!startDate || periodStart < startDate) startDate = periodStart;
          if (!endDate || periodEnd > endDate) endDate = periodEnd;
        }
      }
    }
  });
  
  // If we couldn't determine date range, show all data
  if (!startDate || !endDate) {
    return processedMarketData[metricId].map(point => ({
      ...point,
      period: point.time
    }));
  }
  
  // Filter market data to the date range
  return processedMarketData[metricId].filter(point => {
    try {
      const pointDate = new Date(point.time);
      return pointDate >= startDate && pointDate <= endDate;
    } catch (e) {
      return false;
    }
  }).map(point => ({
    ...point,
    period: point.time
  }));
};
  const getFilteredPriceData = useMemo(() => {
    if (!hasPriceData || !hasPriceMetric || dailyPriceData.length === 0) {
      return [];
    }
    
    // Create a date range from selectedPeriods
    let startDate = null;
    let endDate = null;
    
    // Process the selectedPeriods to determine date range
    selectedPeriods.forEach(period => {
      // Try to parse as a year (like "2021")
      const yearMatch = parseInt(period);
      if (!isNaN(yearMatch)) {
        const periodStart = new Date(yearMatch, 0, 1); // Jan 1
        const periodEnd = new Date(yearMatch, 11, 31); // Dec 31
        
        if (!startDate || periodStart < startDate) startDate = periodStart;
        if (!endDate || periodEnd > endDate) endDate = periodEnd;
      } else {
        // Try to extract a year from other formats (like "Q1 2021")
        const yearExtract = period.match(/\b(20\d{2})\b/);
        if (yearExtract) {
          const year = parseInt(yearExtract[1]);
          
          // For quarters, extract the quarter number
          const quarterMatch = period.match(/Q(\d)/i);
          if (quarterMatch) {
            const quarter = parseInt(quarterMatch[1]);
            const startMonth = (quarter - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
            const endMonth = startMonth + 2; // Last month of quarter
            
            const periodStart = new Date(year, startMonth, 1);
            const periodEnd = new Date(year, endMonth, 31);
            
            if (!startDate || periodStart < startDate) startDate = periodStart;
            if (!endDate || periodEnd > endDate) endDate = periodEnd;
          } else {
            // If we just have a year, use the whole year
            const periodStart = new Date(year, 0, 1);
            const periodEnd = new Date(year, 11, 31);
            
            if (!startDate || periodStart < startDate) startDate = periodStart;
            if (!endDate || periodEnd > endDate) endDate = periodEnd;
          }
        }
      }
    });
    
    // If we couldn't determine date range, show all data
    if (!startDate || !endDate) {
      console.log("Could not determine date range from periods:", selectedPeriods);
      return dailyPriceData.map(point => ({
        ...point,
        period: point.time
      }));
    }
    
    // Filter price data to the date range
    const filteredData = dailyPriceData.filter(point => {
      try {
        const pointDate = new Date(point.time);
        return pointDate >= startDate && pointDate <= endDate;
      } catch (e) {
        console.error("Invalid date in price data:", point.time);
        return false;
      }
    }).map(point => ({
      ...point,
      period: point.time
    }));
    
    console.log(`Filtered price data from ${dailyPriceData.length} to ${filteredData.length} points`);
    return filteredData;
    
  }, [dailyPriceData, hasPriceData, hasPriceMetric, selectedPeriods]); // Include selectedPeriods in dependencies
  const marketDataDisplayNames = {
    'price': 'Price',
    'marketCapDaily': 'Market Cap',
    'peRatioDaily': 'P/E Ratio',
    'psRatioDaily': 'P/S Ratio',
    'pfcfRatioDaily': 'P/FCF Ratio',
    'pcfRatioDaily': 'P/CF Ratio',
    'pbRatioDaily': 'P/B Ratio',
    'fcfYieldDaily': 'FCF Yield'
  };
  
  // Custom legend formatter with total change and CAGR
  const legendFormatter = (value: string) => {
    // Special case for price
    if (isPriceMetric(value)) {
      return `${ticker} - Price`;
    }
      if (isMarketDataMetric(value)) {
      return `${ticker} - ${marketDataDisplayNames[value] || value}`;
    }
    
    const stats = metricsStats[value];
    
    // Get proper display name for the metric
    let displayName = getLocalMetricDisplayName(value);
    
    // If display name is still the same as raw ID, try to format it better
    if (displayName === value) {
      displayName = formatRawMetricId(value);
    }
    
    let result = `${ticker} - ${displayName}`;
    
    // Add axis indicator for multi-axis chart
    if (percentageMetrics.includes(value) && percentageMetrics.length > 0 && normalMetrics.length > 0) {
      result += ' (right axis)';
    } else if (normalMetrics.includes(value) && (percentageMetrics.length > 0 || priceMetrics.length > 0)) {
      result += ' (left axis)';
    } else if (isPriceMetric(value) && (normalMetrics.length > 0 || percentageMetrics.length > 0)) {
      result += ' (far right axis)';
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
    } else if (isPriceMetric(value)) {
      unit = '($)';
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
  
  // Function to determine if we need multiple Y-axes
  const needsDualAxes = percentageMetrics.length > 0 && normalMetrics.length > 0;
  
  // Function to determine if we need a third axis for price
  const needsPriceAxis = priceMetrics.length > 0 && (normalMetrics.length > 0 || percentageMetrics.length > 0);
  const needsMcapAxis = McapMetric.length > 0 && (normalMetrics.length > 0 || percentageMetrics.length > 0);

  const needsMarketDataAxis = priceMetrics.length > 0 || McapMetric.length > 0 && (normalMetrics.length > 0 || percentageMetrics.length > 0);

  // Determine how many axes we need
  const axesCount = 
    (normalMetrics.length > 0 ? 1 : 0) + 
    (percentageMetrics.length > 0 && normalMetrics.length > 0 ? 1 : 0) + 
    (marketDataMetrics.length > 0 && (normalMetrics.length > 0 || percentageMetrics.length > 0) ? 1 : 0);
    ;
  
  // Generate reference lines for statistics
  const renderReferenceLines = () => {
    const referenceLines = [];
    
    metrics.forEach(metricId => {
      // Skip price metrics for reference lines
      if (isPriceMetric(metricId)) return;
      
      const stats = metricStatValues[metricId];
      if (!stats) return;
      
      const color = colorMap[metricId];
      const isPercent = isPercentageMetric(metricId);
      
      // Determine which axis to use for reference lines
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
            xAxisId="financial" // Add this line to ALL reference lines

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
    
    return referenceLines;
  };
  
  const renderExternalReferenceLines = () => {
    if (!statisticalLines || statisticalLines.length === 0) {
      return null;
    }
    
    return statisticalLines.map((statLine, index) => {
      // Skip for price metrics
      if (isPriceMetric(statLine.metricId)) return null;
      
      // For external reference lines, determine color dynamically
      let color = colorMap[statLine.metricId];
      
      // If not found, use a color from the baseColors array
      if (!color) {
        // Create a deterministic color based on company and metric
        const combinedKey = `${statLine.companyTicker}-${statLine.metricId}`;
        const hashCode = combinedKey.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        const colorIndex = Math.abs(hashCode) % baseColors.length;
        color = baseColors[colorIndex];
      }
      
      // Determine if this is a percentage metric
      const isPercent = isPercentageMetric(statLine.metricId);
      
      // Determine which axis to use
      const axisId = needsDualAxes && isPercent ? "percentage" : "normal";
      
      // Set dash pattern based on stat type
      let dash = '3 3'; // Default for average
      if (statLine.statType === 'median') dash = '5 5';
      else if (statLine.statType === 'min' || statLine.statType === 'max') dash = '2 2';
      
      // Format the label based on the type of metric
      const formattedValue = formatValue(statLine.value, isPercent);
      
      return (
        <ReferenceLine 
          key={`ext-${statLine.companyTicker}-${statLine.metricId}-${statLine.statType}-${index}`}
          y={statLine.value} 
          stroke={color} 
          strokeWidth={1.5}
          strokeDasharray={dash}
          ifOverflow="extendDomain"
          xAxisId="financial" // Add this line to ALL reference lines

          yAxisId={axisId}
          label={{
            value: `${statLine.companyTicker} ${statLine.statType}:${formattedValue}`,
            position: 'insideBottomRight',
            fill: "black",
            fontSize: typography.labelSize,
            offset: 5
          }} 
          style={{ zIndex: 1000 }}
        />
      );
    });
  };
  const formatMarketDataYAxis = (value: number) => {
    // For price, use currency format
    if (hasPriceMetric) {
      return `$${value.toFixed(2)}`;
    }
    
    // For ratios, just show the number with 2 decimal places
    return value.toFixed(2);
  };
  // Generate the subtitle based on metrics
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
    const metricNames = metrics.map(metricId => {
      if (isPriceMetric(metricId)) {
        return 'Price';
      }
      return getLocalMetricDisplayName(metricId);
    });
    return metricNames.join(', ');
  };
  
  // Create a custom X-axis formatter that can handle both period strings and dates
  const formatXAxisTick = (value: string) => {
    // Check if this is a date string (for daily price data)
    if (value && typeof value === 'string' && value.includes('-')) {
      try {
        const date = new Date(value);
        // Format based on the range of dates
        if (hasPriceData && dailyPriceData.length > 0) {
          // If we have many points, just show month/year
          if (dailyPriceData.length > 100) {
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          }
          // Otherwise show more detail
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        // If there's an error parsing the date, just return the original value
        return value;
      }
    }
    
    // For period strings (like years or quarters), return as is
    return value;
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
  
  // Format price data label
  const formatPriceDataLabel = (value: any) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    return `${Number(value).toFixed(2)}`;
  };
  
  // The common data accessor function for chart components
  const getDataAccessor = (metric: string) => {
    // Special case for price data
    if (isMarketDataMetric(metric)) {
      return (entry: any) => {
        // Try to get price directly from entry if it exists
        if (entry.price !== undefined) {
          return entry.price;
        }
        
        // Try to get from metrics array
        const foundMetric = entry.metrics?.find((m: any) => m.name === metric);
        return foundMetric ? foundMetric.value : null;
      };
    }
    
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
  const getMarketDataDomain = () => {
    // If no market data metrics, return default range
    if (marketDataMetrics.length === 0) return [0, 100];
    
    // Find min and max values for all market data metrics
    let min = Infinity;
    let max = -Infinity;
    
    // Check all market data
    Object.entries(processedMarketData).forEach(([metricId, dataPoints]) => {
      if (!marketDataMetrics.includes(metricId)) return;
      
      dataPoints.forEach((point: any) => {
        const value = parseFloat(point[metricId]);
        if (!isNaN(value)) {
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
  // Get domain for price axis
  const getPriceDomain = () => {
    // If no price metrics or price data, return default range
    if (!hasPriceMetric || !hasPriceData) return [0, 100];
    
    // Find min and max values for price
    let min = Infinity;
    let max = -Infinity;
    
    // Check price data
    processedPriceData.forEach(point => {
      const value = parseFloat(point.price);
      if (!isNaN(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });
    
    // If no valid data found, return default
    if (min === Infinity || max === -Infinity) return [0, 100];
    
    // Add padding (10% of the range)
    const range = max - min;
    const padding = range * 0.1;
    
    return [Math.max(0, min - padding), max + padding];
  };
  
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
        
        {/* Show indicator for multiple axes if needed
        {axesCount > 1 && (
          <p style={{ fontSize: `${typography.subtitleSize - 2}px` }} className="text-blue-600 mt-1">
            Using multiple Y-axes:
            {normalMetrics.length > 0 && " Left axis (regular values)"}
            {needsDualAxes && " | Right axis (percentages)"}
            {needsPriceAxis && " | Far right axis (price)"}
          </p>
        )}
        
        {/* Show stacked metrics info if needed 
        {effectiveStackedMetrics.length > 0 && (
          <p style={{ fontSize: `${typography.subtitleSize - 2}px` }} className="text-blue-600 mt-1">
            Showing stacked bars for: {effectiveStackedMetrics.map(m => getLocalMetricDisplayName(m)).join(', ')}
          </p>
        )}
        
        {/* Price data info if applicable 
        {hasPriceMetric && hasPriceData && (
          <p style={{ fontSize: `${typography.subtitleSize - 2}px` }} className="text-orange-600 mt-1">
            Showing daily price data ({dailyPriceData.length} points)
          </p>
        )}*/}
      </div>
      
      <div className="flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ 
              top: 20,
              // Adjust right margin based on number of Y-axes
              right: axesCount >= 3 ? 30 : (axesCount >= 2 ? 20 : 10),
              left: 10, 
              bottom: 20 + (typography.legendSize - 12) * 5 // Adjust bottom margin based on legend size
            }}
            barGap={chartDimensions.barGap}
            barCategoryGap={chartDimensions.barCategoryGap}
          >
          <CartesianGrid stroke="#e0e0e0" strokeWidth={0.5} />
          {metrics.filter(isMarketDataMetric).map((metricId) => (
  <XAxis 
    key={`xaxis-${metricId}`}
    dataKey="time" 
    xAxisId={`${metricId}-axis`}  // Use unique ID for each metric's axis
    hide={true}
  />
))}

          {/* Primary X-Axis for financial metrics - visible */}
          <XAxis 
            dataKey="period" 
            xAxisId="financial"
            angle={0} 
            textAnchor="end" 
            height={60}
            tickMargin={10}
            stroke="#666"
            strokeWidth={1}
            tick={{ fontSize: typography.tickSize }}
            // Only show labels for years/quarters
            tickFormatter={(value) => {
              // Check if value is a date string
              return value && typeof value === 'string' && value.includes('-') ? '' : value;
            }}
          />
            {/* Secondary X-Axis for price data - hidden */}

            {/* Primary Y-axis - normal values */}
            {normalMetrics.length > 0 && (
              <YAxis 
                yAxisId="normal"
                orientation="left"
                axisLine={true}
                tickFormatter={formatYAxis}
                tick={{ fontSize: typography.tickSize }}
              />
            )}
            
            {/* Secondary Y-axis for percentages */}
            {needsDualAxes && (
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                axisLine={true}
                tickFormatter={formatPercentageYAxis}
                tick={{ fontSize: typography.tickSize }}
                domain={getPercentageDomain()}
              />
            )}
            {/* Tertiary Y-axis for market data */}
          {needsMarketDataAxis && (
            <YAxis 
              yAxisId="marketData"
              orientation={needsDualAxes ? "right" : "right"}
              axisLine={true}
              tickFormatter={formatMarketDataYAxis}
              tick={{ fontSize: typography.tickSize }}
              domain={getMarketDataDomain()}
              dx={needsDualAxes ? 1 : 0}
              hide={false}
            />
          )}

            {/* Tertiary Y-axis for price
            {needsPriceAxis && (
              <YAxis 
                yAxisId="price"
                orientation={needsDualAxes ? "right" : "right"}
                axisLine={true}
                tickFormatter={formatPriceYAxis}
                tick={{ fontSize: typography.tickSize }}
                domain={getPriceDomain()}
                dx={needsDualAxes ? 55 : 0}
              />
            )} */}
            
            <Tooltip 
          content={
            <CustomTooltip 
              fontSize={typography.tooltipSize}
              data={data}
              //processedPriceData={processedPriceData}
              colorMap={colorMap}
              metrics={metrics}
            />
            } 
/>
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
            {normalMetrics.length > 0 && (
              <ReferenceLine y={0} stroke="#777" strokeDasharray="3 3" yAxisId="normal" xAxisId="financial" />
            )}
            
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
                  xAxisId="financial" // Add this line - specify which x-axis to use

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
            {barMetrics.map((metric, index) => {
              const color = colorMap[metric];
              const showLabels = labelVisibilityArray.length > index
                ? labelVisibilityArray[index]
                : metricLabels[metric] !== false;              
              const dataAccessor = getDataAccessor(metric);
              const isPercent = isPercentageMetric(metric);
              
              // If only percentage metrics exist, everything goes on the "normal" axis
              // If dual axes, then percentages go on "percentage" axis
              const axisId = needsDualAxes && isPercent ? "percentage" : "normal";
              
              return (
                <Bar 
                  key={metric} 
                  xAxisId="financial" // Add this line - specify which x-axis to use

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
            
            {/* Render LINE metrics (higher z-index) */}
            {lineMetrics.filter(metric => !isMarketDataMetric(metric)).map((metric, index) => {
              const color = colorMap[metric];
              const visibilityIndex = barMetrics.length + index;
    
              // Use the visibility array if available and has this index
              const showLabels = labelVisibilityArray.length > visibilityIndex
                ? labelVisibilityArray[visibilityIndex]
                : metricLabels[metric] !== false;
              
              const dataAccessor = getDataAccessor(metric);
              const isPercent = isPercentageMetric(metric);
              
              // If only percentage metrics exist, everything goes on the "normal" axis
              // If dual axes, then percentages go on "percentage" axis
              const axisId = needsDualAxes && isPercent ? "percentage" : "normal";
              
              return (
                <Line 
                  key={metric} 
                  type="linear" 
                  xAxisId="financial" // Add this line - specify which x-axis to use
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
            


{/* Render market data metrics as line charts */}
{/* Render market data metrics as line charts */}
{metrics.filter(isMarketDataMetric).map((metricId) => {
  const marketDataPoints = getFilteredMarketData(metricId);
  
  if (!marketDataPoints || marketDataPoints.length === 0) {
    return null;
  }
  const isRatio = isPercentageMetric(metricId);
  const isMcap = isMcapMetric(metricId);
  
  const yAxisId = isRatio ? "percentage" : "marketData";
  return (
    <Line 
      key={`market-data-${metricId}`}
      data={marketDataPoints}
      dataKey={metricId} // Use the metric ID as the data key
      xAxisId={`${metricId}-axis`} // Use the metric-specific xAxis
      yAxisId={yAxisId} // Use the dedicated market data axis
      name={metricId} // We'll enhance the name display in the legend formatter
      stroke={colorMap[metricId] || '#ff7300'} // Use the color map for consistent colors
      strokeWidth={2}
      dot={false} // Disable dots for better performance with large datasets
      activeDot={{ r: 4 }} // Show dots on hover
      isAnimationActive={false} // Disable animation for better performance
      connectNulls={true} // Connect points even with null values in between
      zIndex={20} // Keep line charts on top
    />
  );
})}
            
            {/* Render reference lines */}
            {renderReferenceLines()}
            {renderExternalReferenceLines()}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;