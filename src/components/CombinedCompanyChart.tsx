import React, { useRef, useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, TooltipProps, ReferenceLine
} from 'recharts';
import { ChartType } from '@/types/chartTypes';
import { getMetricDisplayName } from '@/utils/metricDefinitions';
import { calculateCAGR } from './financials/chartUtils';

// Calculate responsive bar sizing based on chart width and data
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
  data: any[]; // Combined data array
  companies: CompanyData[]; // List of companies
  metrics: string[]; // Array of metric IDs
  metricTypes: Record<string, ChartType>; // Chart type for each metric
  metricLabels: Record<string, boolean>; // Control data label visibility
  metricSettings: Record<string, {
    average?: boolean;
    median?: boolean;
    min?: boolean;
    max?: boolean;
  }>;
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
  
  return (
    <div className="h-full w-full flex flex-col relative" ref={chartRef}>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tickMargin={10}
              tick={{ fontSize: typography.tickSize }}
            />
            <YAxis 
              tickFormatter={formatYAxis} 
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
                      label={(props) => {
                        const { x, y, value } = props;
                        // Only show labels for the last data point
                        if (props.index === data.length - 1) {
                          return (
                            <text
                              x={x}
                              y={y}
                              dy={-10}
                              fill={color}
                              fontSize={typography.labelSize}
                              textAnchor="middle"
                            >
                              {typeof value === 'number' ? formatYAxis(value) : ''}
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  );
                } else {
                  return (
                    <Bar 
                      key={dataKey}
                      dataKey={dataKey}
                      name={dataKey}
                      fill={color}
                      barSize={chartDimensions.barSize}
                      label={(props) => {
                        const { x, y, width, height, value } = props;
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 5}
                            fill="black"
                            fontSize={typography.labelSize}
                            textAnchor="middle"
                          >
                            {typeof value === 'number' ? formatYAxis(value) : ''}
                          </text>
                        );
                      }}
                    />
                  );
                }
              })
            ))}
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