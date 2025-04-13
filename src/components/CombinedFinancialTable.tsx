import React from 'react';
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { PlusCircle } from "lucide-react";

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
  
  // *** MODIFIED: Combine all company data into one dataset for the table ***
  const getAllPeriodsFromCompanies = () => {
    // Collect all unique periods from all companies' data
    const allPeriods = new Set<string>();
    
    companies.forEach(company => {
      if (company.metricData && company.metricData.length > 0) {
        company.metricData.forEach(item => {
          if (item.period) {
            allPeriods.add(item.period);
          }
        });
      }
    });
    
    return Array.from(allPeriods);
  };
  
  // Create table data from all companies' full data (not limited by slider)
  const createFullTableData = () => {
    // Get all unique periods
    const allPeriods = getAllPeriodsFromCompanies();
    if (allPeriods.length === 0) return [];
    
    // Create a map of periods to table rows
    const tableDataMap: Record<string, any> = {};
    
    // Initialize table data structure with all periods
    allPeriods.forEach(period => {
      tableDataMap[period] = { period };
    });
    
    // Populate the table data with values from all companies
    companies.forEach(company => {
      if (!company.metricData || company.metricData.length === 0) return;
      
      // For each period in this company's data
      company.metricData.forEach(dataPoint => {
        const period = dataPoint.period;
        
        // Skip if period doesn't exist (shouldn't happen)
        if (!tableDataMap[period]) return;
        
        // For each metric in this period
        dataPoint.metrics?.forEach((metric: any) => {
          // Only include visible metrics
          if (metrics.includes(metric.name) && metricVisibility[metric.name] !== false) {
            // Create a company-specific metric ID
            const companyMetricKey = `${company.ticker}_${metric.name}`;
            tableDataMap[period][companyMetricKey] = metric.value;
          }
        });
      });
    });
    
    // Convert the map to an array
    const tableData = Object.values(tableDataMap);
    
    return tableData;
  };
  
  // Process the full table data to show last 9 years + TTM
  const getTableData = () => {
    const allTableData = createFullTableData();
    if (!allTableData || allTableData.length === 0) return [];
    
    // Define how many periods to show
    const maxPeriods = 10; // 9 years + TTM
    
    // Create a copy to avoid modifying the original data
    let tableData = [...allTableData];
    
    // Check if there's TTM data
    const hasTTM = tableData.some(item => item.period === 'TTM');
    
    // Special handling for TTM - remove it temporarily for sorting
    let ttmData = null;
    if (hasTTM) {
      ttmData = tableData.find(item => item.period === 'TTM');
      tableData = tableData.filter(item => item.period !== 'TTM');
    }
    
    // Sort chronologically (oldest to newest)
    tableData.sort((a, b) => {
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
    
    // Take only the most recent data points (excluding TTM)
    const recentData = tableData.slice(-Math.min(maxPeriods - (hasTTM ? 1 : 0), tableData.length));
    
    // Add TTM back at the end if it exists
    if (ttmData) {
      recentData.push(ttmData);
    }
    
    return recentData;
  };
  
  // Get the table data with consistent display (last 9 years + TTM)
  const tableData = getTableData();
  
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500 border-b border-r border-gray-200" style={{ width: '250px', minWidth: '250px' }}>
              Metric
            </th>
            {tableData.map((dataPoint) => (
              <th 
                key={dataPoint.period} 
                className="px-3 py-2 text-right font-medium text-gray-500 border-b border-gray-200" 
                style={{ width: `${100 / tableData.length}%` }}
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
                    <PlusCircle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-800">
                        {company.ticker} - {getMetricDisplayName(metric)}
                      </span>
                    </div>
                  </td>
                  
                  {tableData.map((dataPoint) => {
                    // Get value from combined data using the dataKey
                    const value = dataPoint[dataKey];
                    
                    return (
                      <td 
                        key={`${dataPoint.period}-${dataKey}`} 
                        className="px-3 py-2 text-right font-medium text-gray-600 border-gray-100"
                        style={{ width: `${100 / tableData.length}%` }}
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