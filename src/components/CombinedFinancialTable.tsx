import React from 'react';
import { getMetricDisplayName } from "@/utils/metricDefinitions";

interface CompanyData {
  ticker: string;
  name: string;
  metricData: any[];
  isLoading: boolean;
  error: string | null;
}

interface CombinedFinancialTableProps {
  data: any[]; // Combined data array
  companies: CompanyData[]; // List of companies
  metrics: string[]; // Array of visible metric IDs
  metricVisibility: Record<string, boolean>; // Visibility flags
}

const formatDisplayValue = (value: any): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '-';
  }
  
  const num = Number(value);
  
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  } else if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  } else if (Math.abs(num) >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

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

// Calculate CAGR - Compound Annual Growth Rate
const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100);
};

const CombinedFinancialTable: React.FC<CombinedFinancialTableProps> = ({
  data,
  companies,
  metrics,
  metricVisibility
}) => {
  // Generate colors for companies and metrics (matching chart)
  const colorMap: Record<string, string> = {};
  const baseColors = [
    '#2563eb', '#db2777', '#16a34a', '#ea580c', '#8b5cf6', 
    '#0891b2', '#4338ca', '#b91c1c', '#4d7c0f', '#6d28d9'
  ];
  
  // Assign colors to each company-metric combination (must match chart colors)
  companies.forEach((company, companyIndex) => {
    metrics.forEach((metric, metricIndex) => {
      // Create unique key for company-metric combination
      const key = `${company.ticker}_${metric}`;
      
      // Calculate a unique color index by combining company and metric indices
      const colorIndex = (companyIndex * metrics.length + metricIndex) % baseColors.length;
      colorMap[key] = baseColors[colorIndex];
    });
  });
  
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
    
    // Fallback to string comparison
    return a.period.localeCompare(b.period);
  });
  
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500 border-b border-r border-gray-200" style={{ width: '250px', minWidth: '250px' }}>
              Metric
            </th>
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
          {companies.map(company => 
            metrics.map((metric, idx) => {
              const dataKey = `${company.ticker}_${metric}`;
              const color = colorMap[dataKey];
              
              // Calculate stats for this metric
              const stats = calculateMetricStats(company.metricData, metric);
              
              return (
                <tr 
                  key={dataKey} 
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 text-left font-medium border-r border-gray-200" style={{ width: '250px', minWidth: '250px' }}>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                      <span className="text-gray-800">
                        {company.ticker} - {getMetricDisplayName(metric)}
                      </span>
                    </div>
                  </td>
                  
                  {sortedData.map((dataPoint) => {
                    // Get value from combined data using the dataKey
                    const value = dataPoint[dataKey];
                    
                    return (
                      <td 
                        key={`${dataPoint.period}-${dataKey}`} 
                        className="px-3 py-2 text-right font-medium text-gray-600 border-gray-100"
                        style={{ width: `${100 / sortedData.length}%` }}
                      >
                        {formatDisplayValue(value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CombinedFinancialTable;