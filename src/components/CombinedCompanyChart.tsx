import React, { useRef, useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, TooltipProps, ReferenceLine, LabelList
} from 'recharts';
import { ChartType } from '@/types/chartTypes';
import { getMetricDisplayName } from '@/utils/metricDefinitions';
import { calculateCAGR } from './financials/chartUtils';
import ChartExport from '@/components/financials/ChartExport';

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
    const maxCategoryGapPercentage = 0.3;
    
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

// Custom tooltip component for multi-company chart
const CustomTooltip = ({ active, payload, label, fontSize }: TooltipProps<number, string> & { fontSize: number }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  // Group metrics by company
  const companiesData: Record<string, { color: string; metrics: Array<{ name: string, value: number }> }> = {};
  
  payload.forEach((entry) => {
    // Extract company ticker from dataKey (format: TICKER_metricName)
    const dataKey = String(entry.dataKey);
    const [ticker, ...metricParts] = dataKey.split('_');
    const metricName = metricParts.join('_'); // Rejoin in case metric name contains underscores
    
    if (!companiesData[ticker]) {
      companiesData[ticker] = {
        color: entry.color as string,
        metrics: []
      };
    }
    
    companiesData[ticker].metrics.push({
      name: getMetricDisplayName(metricName),
      value: entry.value as number
    });
  });
  const getFormattedLegends = () => {
    const legends: Record<string, string> = {};
    
    companies.forEach(company => {
      metrics.forEach(metric => {
        const key = `${company.ticker}_${metric}`;
        
        // Get proper display name for the metric
        const displayName = getMetricDisplayName(metric);
        
        // Get stats for this metric
        const stats = calculateMetricStats(company.metricData, metric);
        
        // Determine if the metric is related to money
        const isMoneyMetric = metric === 'revenue' || metric === 'netIncome' || 
                             metric.includes('income') || metric.includes('cash') || 
                             metric.includes('liabilities');
        
        // Construct legend text
        let legend = `${company.ticker} - ${displayName}`;
        
        // Add units
        if (isMoneyMetric) {
          legend += ` (Millions)`;
        } else if (isPercentageMetric(metric)) {
          legend += ` (%)`;
        }
        
        // Add total change if available
        if (stats.totalChange !== null) {
          legend += ` (Total Change: ${stats.totalChange.toFixed(2)}%)`;
        }
        
        // Add CAGR if available
        if (stats.cagr !== null) {
          legend += ` (CAGR: ${stats.cagr.toFixed(2)}%)`;
        }
        
        legends[key] = legend;
      });
    });
    
    return legends;
  };
  return (
    <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md" style={{ fontSize: `${fontSize}px` }}>
      <p className="font-medium text-gray-800">{label}</p>
      <div className="mt-2">
        {Object.entries(companiesData).map(([ticker, company]) => (
          <div key={ticker} className="mt-1 pt-1 border-t first:border-t-0 first:pt-0 first:mt-0">
            <p className="font-medium" style={{ color: company.color }}>{ticker}</p>
            <div className="space-y-1 mt-1">
              {company.metrics.map((metric, idx) => {
                let formattedValue = metric.value;
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
                    key={`${ticker}-metric-${idx}`} 
                    className="flex justify-between gap-4"
                  >
                    <span>{metric.name}: </span>
                    <span className="font-semibold">{formattedValue}{suffix}</span>
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

interface CompanyData {
  ticker: string;
  name: string;
  metricData: any[];
  isLoading: boolean;
  error: string | null;
}

interface CombinedCompanyChartProps {
  data: any[];
  companies: CompanyData[];
  metrics: string[];
  metricTypes: Record<string, ChartType>;
  metricLabels: Record<string, boolean>;
  metricSettings: Record<string, {
    average?: boolean;
    median?: boolean;
    min?: boolean;
    max?: boolean;
  }>;
  exportMode?: boolean; // Add this flag
}


// Calculate statistics for a company's metric
const calculateMetricStats = (companyData: any[], metricId: string) => {
  if (!companyData || !companyData.length) {
    return { totalChange: null, cagr: null };
  }
  
  // Extract values for this metric
  const values: { period: string; value: number }[] = [];
  companyData.forEach(item => {
    const metricData = item.metrics?.find((m: any) => m.name === metricId);
    if (metricData && !isNaN(metricData.value)) {
      values.push({
        period: item.period,
        value: typeof metricData.value === 'number' ? metricData.value : parseFloat(metricData.value)
      });
    }
  });
  
  // Need at least 2 values to calculate
  if (values.length < 2) return { totalChange: null, cagr: null };
  
  // Sort by period (exclude TTM for calculations)
  const numericValues = values.filter(v => v.period !== 'TTM');
  numericValues.sort((a, b) => {
    return parseInt(a.period) - parseInt(b.period);
  });
  
  if (numericValues.length < 2) return { totalChange: null, cagr: null };
  
  const startValue = numericValues[0].value;
  const endValue = numericValues[numericValues.length - 1].value;
  
  // Calculate total change
  const totalChange = (startValue !== 0) ? 
    ((endValue - startValue) / Math.abs(startValue)) * 100 : null;
  
  // Calculate CAGR
  let years = parseInt(numericValues[numericValues.length - 1].period) - parseInt(numericValues[0].period);
  if (isNaN(years) || years <= 0) years = numericValues.length - 1;
  
  const cagr = (startValue > 0 && endValue > 0 && years > 0) ?
    calculateCAGR(startValue, endValue, years) : null;
  
  return { totalChange, cagr };
};

// Function to check if a metric name suggests it's a percentage
const isPercentageMetric = (metricId: string): boolean => {
  const lowerMetricId = metricId.toLowerCase();
  return lowerMetricId.includes('percent') || 
         lowerMetricId.includes('margin') || 
         lowerMetricId.includes('ratio') ||
         lowerMetricId.includes('growth') ||
         lowerMetricId.includes('rate');
};

const CombinedCompanyChart: React.FC<CombinedCompanyChartProps> = ({ 
  data, 
  companies,
  metrics, 
  metricTypes,
  metricLabels,
  metricSettings
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({
    barSize: 30,
    barGap: 4,
    barCategoryGap: 20
  });
  
  const [typography, setTypography] = useState({
    titleSize: 18,
    subtitleSize: 14,
    legendSize: 12,
    labelSize: 11,
    tickSize: 10,
    tooltipSize: 12,
    iconSize: 10
  });
  
  // Generate colors for companies and metrics
  const colorMap: Record<string, string> = {};
  const baseColors = [
    '#2563eb', '#db2777', '#16a34a', '#ea580c', '#8b5cf6', 
    '#0891b2', '#4338ca', '#b91c1c', '#4d7c0f', '#6d28d9'
  ];
  
  // Assign colors to each company-metric combination
  companies.forEach((company, companyIndex) => {
    metrics.forEach((metric, metricIndex) => {
      // Create unique key for company-metric combination
      const key = `${company.ticker}_${metric}`;
      
      // Calculate a unique color index by combining company and metric indices
      const colorIndex = (companyIndex * metrics.length + metricIndex) % baseColors.length;
      colorMap[key] = baseColors[colorIndex];
    });
  });

  // Count total bar metrics for sizing calculation
  const getBarMetricCount = () => {
    let count = 0;
    companies.forEach(company => {
      metrics.forEach(metric => {
        if (metricTypes[metric] === 'bar') {
          count++;
        }
      });
    });
    return Math.max(1, count); // Ensure at least 1 to avoid division by zero
  };
  
  // Update dimensions and typography when component mounts, window resizes, or data changes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const containerWidth = chartRef.current.offsetWidth;
        const totalBarCount = getBarMetricCount();
        
        // Update bar sizing
        const barSizing = calculateResponsiveBarSizing(
          containerWidth,
          data?.length || 0,
          totalBarCount
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
  }, [data, companies, metrics, metricTypes]);
  
  // Custom legend formatter to show company and metric name with stats
  const legendFormatter = (value: string) => {
    // Split the value to get company ticker and metric ID
    const [ticker, ...metricParts] = value.split('_');
    const metricId = metricParts.join('_'); // Rejoin in case metric name contains underscores
    
    // Get company name and data
    const company = companies.find(c => c.ticker === ticker);
    
    // Get metric display name
    const metricDisplayName = getMetricDisplayName(metricId);
    
    // Calculate stats for this company's metric
    const stats = company ? calculateMetricStats(company.metricData, metricId) : { totalChange: null, cagr: null };
    
    // Determine if the metric is related to money (for millions label)
    const isMoneyMetric = metricId === 'revenue' || metricId === 'netIncome' || metricId.includes('income') || metricId.includes('cash') || metricId.includes('liabilities');
    
    // Construct legend text
    let result = `${ticker} - ${metricDisplayName}`;
    
    // Add units (Millions) for money metrics
    if (isMoneyMetric) {
      result += ` (Millions)`;
    } else if (isPercentageMetric(metricId)) {
      result += ` (%)`;
    }
    
    // Add total change if available
    if (stats.totalChange !== null) {
      result += ` (Total Change: ${stats.totalChange.toFixed(2)}%)`;
    }
    
    // Add CAGR if available
    if (stats.cagr !== null) {
      result += ` (CAGR: ${stats.cagr.toFixed(2)}%)`;
    }
    
    return <span style={{ color: '#000000' }}>{result}</span>;
  };

  // Calculate statistics for each metric-company combination
  const calculateMetricStatValues = () => {
    const statValues: Record<string, Record<string, number>> = {};
    
    companies.forEach(company => {
      if (!company.metricData || !company.metricData.length) return;
      
      metrics.forEach(metric => {
        const key = `${company.ticker}_${metric}`;
        
        // Skip if no settings enabled for this metric
        const settings = metricSettings[metric];
        if (!settings) return;
        
        // Only proceed if any statistic is enabled
        if (settings.average || settings.median || settings.min || settings.max) {
          const values: number[] = [];
          
          // Extract values for this metric from company data
          company.metricData.forEach(item => {
            const metricData = item.metrics?.find((m: any) => m.name === metric);
            if (metricData && !isNaN(metricData.value)) {
              values.push(typeof metricData.value === 'number' ? 
                metricData.value : parseFloat(metricData.value));
            }
          });
          
          // Skip if no valid values found
          if (values.length === 0) return;
          
          statValues[key] = {};
          
          // Calculate statistics
          if (settings.average) {
            statValues[key].average = values.reduce((sum, val) => sum + val, 0) / values.length;
          }
          
          if (settings.median || settings.min || settings.max) {
            const sortedValues = [...values].sort((a, b) => a - b);
            
            if (settings.min) {
              statValues[key].min = sortedValues[0];
            }
            
            if (settings.max) {
              statValues[key].max = sortedValues[sortedValues.length - 1];
            }
            
            if (settings.median) {
              const mid = Math.floor(sortedValues.length / 2);
              statValues[key].median = sortedValues.length % 2 === 0
                ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
                : sortedValues[mid];
            }
          }
        }
      });
    });
    
    return statValues;
  };

  // Generate reference lines for statistics
  const renderReferenceLines = () => {
    const referenceLines = [];
    const statValues = calculateMetricStatValues();
    
    Object.keys(statValues).forEach(key => {
      const [ticker, ...metricParts] = key.split('_');
      const metricId = metricParts.join('_');
      const stats = statValues[key];
      const color = colorMap[key];
      
      // Helper to add a reference line with proper styling
      const addReferenceLine = (value: number, label: string, dash: string = '3 3') => {
        // Format the value with appropriate abbreviation
        const formattedValue = formatValue(value, isPercentageMetric(metricId));
        
        referenceLines.push(
          <ReferenceLine 
            key={`${key}-${label}`}
            y={value} 
            stroke={color} 
            strokeWidth={1.5}
            strokeDasharray={dash}
            ifOverflow="extendDomain"
            label={{
              value: `${ticker} ${label}:${formattedValue}`,
              position: 'insideBottomRight',
              fill: "black",
              fontSize: typography.labelSize,
              offset: 5
            }} 
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
  const getExportData = () => {
    if (!data || data.length === 0) return [];
    
    // Transform the data to match the format expected by ChartExport
    const exportData = data.map(item => {
      const exportItem = {
        period: item.period,
        metrics: []
      };
      
      // Extract metrics from company-metric combinations with proper formatting
      companies.forEach(company => {
        metrics.forEach(metric => {
          const key = `${company.ticker}_${metric}`;
          if (item[key] !== undefined) {
            // Create a well-formatted metric name that will display properly in the legend
            // This matches how the metric names are formatted in the main chart
            const metricDisplayName = getMetricDisplayName(metric);
            const formattedName = `${company.ticker} - ${metricDisplayName}`;
            
            // Add the metric with formatted name
            exportItem.metrics.push({
              name: formattedName, // Use formatted name instead of raw key
              value: item[key]
            });
          }
        });
      });
      
      return exportItem;
    });
    
    return exportData;
  };
  
  // Get combined metrics for export with proper formatting
  const getCombinedMetrics = () => {
    const combinedMetrics = [];
    
    companies.forEach(company => {
      metrics.forEach(metric => {
        // Use the same formatting as in the main chart's legend
        const metricDisplayName = getMetricDisplayName(metric);
        const formattedName = `${company.ticker} - ${metricDisplayName}`;
        combinedMetrics.push(formattedName);
      });
    });
    
    return combinedMetrics;
  };
  const getExportLabelVisibilityArray = () => {
    // Get the formatted metrics array
    const combinedMetrics = getCombinedMetrics();
    const visibilityArray = [];
    
    // For each formatted metric, figure out its visibility setting
    combinedMetrics.forEach((formattedMetric) => {
      // Extract company ticker and metric display name
      const parts = formattedMetric.split(' - ');
      if (parts.length >= 2) {
        const ticker = parts[0];
        const displayName = parts[1].split('(')[0].trim();
        
        // Find the original metric ID that matches this display name
        let found = false;
        for (const metricId of metrics) {
          if (getMetricDisplayName(metricId) === displayName) {
            // Found the match - use its visibility setting
            visibilityArray.push(metricLabels[metricId] !== false);
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Default to showing labels if no match found
          visibilityArray.push(true);
        }
      } else {
        // Default for malformed metrics
        visibilityArray.push(true);
      }
    });
    
    return visibilityArray;
  };
  const getExportMetricLabels = () => {
    const exportLabels = {};
    
    // For each company and metric
    companies.forEach(company => {
      metrics.forEach(metric => {
        // Format the metric name the same way getCombinedMetrics does
        const metricDisplayName = getMetricDisplayName(metric);
        const formattedName = `${company.ticker} - ${metricDisplayName}`;
        
        // Use the original metric label setting for this formatted name
        exportLabels[formattedName] = metricLabels[metric];
      });
    });
    
    return exportLabels;
  };
  // Transform metricTypes for export to match formatted metric names
  const getExportMetricTypes = () => {
    const exportMetricTypes = {};
    
    companies.forEach(company => {
      metrics.forEach(metric => {
        // Use the same formatted metric name that we use in getCombinedMetrics
        const metricDisplayName = getMetricDisplayName(metric);
        const formattedName = `${company.ticker} - ${metricDisplayName}`;
        
        // Apply the original metric's chart type to the formatted name
        exportMetricTypes[formattedName] = metricTypes[metric] || 'bar';
      });
    });
    
    return exportMetricTypes;
  };
  const getLegendText = (value: string): string => {
    // Split the value to get company ticker and metric ID
    const [ticker, ...metricParts] = value.split('_');
    const metricId = metricParts.join('_'); // Rejoin in case metric name contains underscores
    
    // Get company and data
    const company = companies.find(c => c.ticker === ticker);
    
    // Get metric display name
    const metricDisplayName = getMetricDisplayName(metricId);
    
    // Calculate stats for this company's metric
    const stats = company ? calculateMetricStats(company.metricData, metricId) : { totalChange: null, cagr: null };
    
    // Determine if the metric is related to money (for millions label)
    const isMoneyMetric = metricId === 'revenue' || metricId === 'netIncome' || metricId.includes('income') || metricId.includes('cash') || metricId.includes('liabilities');
    
    // Construct legend text
    let result = `${ticker} - ${metricDisplayName}`;
    
    // Add units (Millions) for money metrics
    if (isMoneyMetric) {
      result += ` (Millions)`;
    } else if (isPercentageMetric(metricId)) {
      result += ` (%)`;
    }
    
    // Add total change if available
    if (stats.totalChange !== null) {
      result += ` (Total Change: ${stats.totalChange.toFixed(2)}%)`;
    }
    
    // Add CAGR if available
    if (stats.cagr !== null) {
      result += ` (CAGR: ${stats.cagr.toFixed(2)}%)`;
    }
    
    return result;
  };
  const getPreFormattedLegends = () => {
    const legends: Record<string, string> = {};
    
    companies.forEach(company => {
      metrics.forEach(metric => {
        const key = `${company.ticker}_${metric}`;
        // Use the text-only formatter
        legends[key] = getLegendText(key);
      });
    });
    console.log("legends")
    console.log(legends)

    return legends;
  };
  const getStatisticalLines = () => {
    const statisticalLines = [];
    const statValues = calculateMetricStatValues();
    
    Object.keys(statValues).forEach(key => {
      const [ticker, ...metricParts] = key.split('_');
      const metricId = metricParts.join('_');
      const stats = statValues[key];
      
      // Add each enabled statistic to the array
      if (stats.average !== undefined) {
        statisticalLines.push({
          companyTicker: ticker,
          metricId,
          statType: 'average',
          value: stats.average
        });
      }
      
      if (stats.median !== undefined) {
        statisticalLines.push({
          companyTicker: ticker,
          metricId,
          statType: 'median',
          value: stats.median
        });
      }
      
      if (stats.min !== undefined) {
        statisticalLines.push({
          companyTicker: ticker,
          metricId,
          statType: 'min',
          value: stats.min
        });
      }
      
      if (stats.max !== undefined) {
        statisticalLines.push({
          companyTicker: ticker,
          metricId,
          statType: 'max',
          value: stats.max
        });
      }
    });
    
    return statisticalLines;
  };
  // Prepare the filename for export
  const getExportFileName = () => {
    const tickers = companies.map(c => c.ticker).join('-');
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return `${tickers}-comparison-${date}`;
  };
  const getDirectLegendTexts = () => {
    const legends: string[] = [];
    
    // Generate legends in the same order as metrics appear in the chart
    companies.forEach(company => {
      metrics.forEach(metric => {
        const key = `${company.ticker}_${metric}`;
        
        // Get proper display name for the metric
        const metricDisplayName = getMetricDisplayName(metric);
        
        // Get statistics for this company's metric
        const stats = calculateMetricStats(company.metricData, metric);
        
        // Determine if the metric is related to money
        const isMoneyMetric = metric === 'revenue' || metric === 'netIncome' || 
                             metric.includes('income') || metric.includes('cash') || 
                             metric.includes('liabilities');
        
        // Format the name as in the main chart's legend
        let legendText = `${company.ticker} - ${metricDisplayName}`;
        
        // Add units for money metrics
        if (isMoneyMetric) {
          legendText += ' (Millions)';
        } else if (isPercentageMetric(metric)) {
          legendText += ' (%)';
        }
        
        // Add total change if available
        if (stats.totalChange !== null) {
          legendText += ` (Total Change: ${stats.totalChange.toFixed(2)}%)`;
        }
        
        // Add CAGR if available
        if (stats.cagr !== null) {
          legendText += ` (CAGR: ${stats.cagr.toFixed(2)}%)`;
        }
        
        legends.push(legendText);
      });
    });
    
    return legends;
  };
  return (
    <div className="h-full w-full flex flex-col relative" ref={chartRef}>
      {/* Export Button */}
      <div className="flex justify-end mb-2">
      {data && data.length > 0 && (
        <ChartExport 
  data={getExportData()}
  metrics={getCombinedMetrics()}
  ticker={companies.map(c => c.ticker).join('_')}
  metricTypes={getExportMetricTypes()}
  stackedMetrics={[]}
  companyName={companies.map(c => c.name).join(' vs ')}
  title={`${companies.map(c => c.name).join(' vs. ')} - Comparison`}
  metricSettings={metricSettings}
  metricLabels={getExportMetricLabels}
  labelVisibilityArray={getExportLabelVisibilityArray()} // Pass the new array

  fileName={getExportFileName()}
  directLegends={getDirectLegendTexts()} // Pass legends directly as an array
  statisticalLines={getStatisticalLines()} // Pass the statistical lines

/>
  )}
      </div>
      
      {/* Chart Title */}
      <div className="text-center mb-2">
        <h3 style={{ fontSize: `${typography.titleSize}px` }} className="font-medium text-gray-800">
          {companies.map(c => c.name).join(' vs. ')} - Comparison
        </h3>
        <p style={{ fontSize: `${typography.subtitleSize}px` }} className="text-gray-500">
          {metrics.map(m => getMetricDisplayName(m)).join(', ')}
        </p>
      </div>
      
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ 
              top: 20, 
              right: 30, 
              left: 20, 
              bottom: 120 + (typography.legendSize - 12) * 5 // Adjust bottom margin based on legend size
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
            <YAxis 
              tickFormatter={formatYAxis} 
              axisLine={false}
              tick={{ fontSize: typography.tickSize }}
            />
            <Tooltip 
              content={<CustomTooltip fontSize={typography.tooltipSize} />} 
            />

            <Legend 
              formatter={(value) => (
                <span style={{ fontSize: `${typography.legendSize}px` }}>
                  {legendFormatter(value)}
                </span>
              )}
              wrapperStyle={{ 
                paddingTop: 10, 
                left: 70, 
                bottom: 100 + (typography.legendSize - 12) * 3 // Adjust based on font size
              }} 
              layout="vertical" 
              align="center" 
              verticalAlign="bottom" 
              iconType="circle" 
              iconSize={typography.iconSize}
            />
            
            {/* Reference line at y=0 */}
            <ReferenceLine y={0} stroke="#777" strokeDasharray="3 3" />
            

            
            {/* Generate chart elements for each company-metric combination */}
            {companies.map(company => (
              metrics.map(metric => {
                const dataKey = `${company.ticker}_${metric}`;
                const color = colorMap[dataKey];
                const chartType = metricTypes[metric] || 'bar';
                const showLabels = metricLabels[metric] !== false;
                
                if (chartType === 'line') {
                  return (
                    <Line 
                      key={dataKey}
                      type="linear"
                      dataKey={dataKey}
                      name={dataKey}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 4, fill: color }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    >
                      {showLabels && (
                        <LabelList 
                          dataKey={dataKey}
                          position="top"
                          fill={"black"}
                          fontSize={typography.labelSize}
                          formatter={(value) => formatYAxis(value)}
                        />
                      )}
                    </Line>
                  );
                } else {
                  return (
                    <Bar 
                      key={dataKey}
                      dataKey={dataKey}
                      name={dataKey}
                      fill={color}
                      barSize={chartDimensions.barSize}
                    >
                      {showLabels && (
                        <LabelList 
                          dataKey={dataKey}
                          position="top"
                          fill={"black"}
                          fontSize={typography.labelSize}
                          formatter={(value) => formatYAxis(value)}
                        />
                      )}
                    </Bar>
                  );
                }
              })
            ))}
                        {/* Add reference lines for statistics */}
                        {renderReferenceLines()}
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Logo in the bottom right corner */}
        <div className="absolute bottom-0 right-0 flex items-center">
          <p className="text-gray-600 font-medium mr-2" style={{ fontSize: `${typography.subtitleSize}px` }}>
            Powered by
          </p>
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

export default CombinedCompanyChart;