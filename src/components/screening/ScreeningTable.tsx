import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ScreeningMetric } from "@/types/screening";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TickerCell } from "./TickerCell";
import CompanyInfoCell from "./CompanyInfoCell";

interface ScreeningTableProps {
  metrics: ScreeningMetric[];
  results: any[];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

interface BaseMetric {
  id: string;
  field: string;
  name: string;
  align?: 'left' | 'right';
}

// Define base metrics that should always be shown
const BASE_METRICS: BaseMetric[] = [
  { id: 'price', field: 'price', name: 'Price', align: 'right' },
  { id: 'marketCap', field: 'marketCap', name: 'Market Cap', align: 'right' }
];

const formatCurrency = (value: number, compact: boolean = false) => {
  if (value === null || value === undefined) return '-';
  
  if (compact) {
    if (Math.abs(value) >= 1_000_000_000_000) {
      return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
  }
  
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercentage = (value: number) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(2)}%`;
};

const formatValue = (value: any, metric: BaseMetric) => {
  if (value === null || value === undefined) return '-';

  const fieldLower = metric.field.toLowerCase();
  
  // Handle percentage metrics
  if (fieldLower.includes('margin') || 
      fieldLower.includes('ratio') || 
      fieldLower.includes('growth') ||
      fieldLower.includes('return') ||
      fieldLower.includes('yield')) {
    return formatPercentage(value);
  }
  
  // Handle price
  if (fieldLower === 'price') {
    return formatCurrency(value, false);
  }
  
  // Handle market cap and other large numbers
  if (fieldLower === 'marketcap' || 
      fieldLower.includes('revenue') || 
      fieldLower.includes('income') || 
      fieldLower.includes('ebitda') ||
      fieldLower.includes('assets') ||
      fieldLower.includes('liabilities') ||
      fieldLower.includes('cash') ||
      fieldLower.includes('debt')) {
    return formatCurrency(value, true);
  }
  
  // Handle volume
  if (fieldLower.includes('volume')) {
    return value.toLocaleString();
  }
  
  // Default number formatting
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  
  return value;
};

export const ScreeningTable = ({ metrics, results }: ScreeningTableProps) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Filter out base metrics from user-selected metrics to avoid duplicates
  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => 
      !BASE_METRICS.some(baseMetric => baseMetric.field === metric.field)
    );
  }, [metrics]);

  // Get all available metrics based on the actual data in results
  const availableMetrics = useMemo(() => {
    if (results.length === 0) return [];
    
    const firstResult = results[0];
    const availableFields = new Set(Object.keys(firstResult));
    
    return filteredMetrics.filter(metric => 
      availableFields.has(metric.field) || 
      availableFields.has(metric.id)
    );
  }, [filteredMetrics, results]);

   // Handle ticker click navigation using window.location
   const handleTickerClick = (ticker) => {
    window.location.href = `/analysis?ticker=${ticker}`;
  };

  const handleSort = (key: string) => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === key) {
        if (currentSort.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedResults = () => {
    if (!sortConfig) return results;

    return [...results].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortedResults = getSortedResults();

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results found. Try adjusting your screening criteria.
      </div>
    );
  }
  

  return (
    <div className="border rounded-lg overflow-x-auto bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center whitespace-nowrap">
                Ticker
                {getSortIcon('symbol')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[300px]"
              onClick={() => handleSort('companyName')}
            >
              <div className="flex items-center whitespace-nowrap">
                Company Info
                {getSortIcon('companyName')}
              </div>
            </th>
            {BASE_METRICS.map((metric) => (
              <th 
                key={metric.id}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(metric.field)}
              >
                <div className="flex items-center justify-end whitespace-nowrap">
                  {metric.name}
                  {getSortIcon(metric.field)}
                </div>
              </th>
            ))}
            {filteredMetrics.map((metric) => (
              <th 
                key={metric.id}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(metric.field)}
              >
                <div className="flex items-center justify-end whitespace-nowrap">
                  {metric.name}
                  {getSortIcon(metric.field)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedResults.map((company) => (
            <tr 
              key={company.symbol} 
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-left">
                <TickerCell 
                  symbol={company.symbol} 
                  onClick={handleTickerClick}
                />
              </td>
              <td className="px-6 py-4">
                <CompanyInfoCell
                  companyName={company.companyName}
                  exchange={company.exchange}
                  country={company.country}
                />
              </td>
              {BASE_METRICS.map((metric) => (
                <td 
                  key={metric.id} 
                  className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900"
                >
                  {formatValue(company[metric.field], metric)}
                </td>
              ))}
              {filteredMetrics.map((metric) => (
                <td 
                  key={metric.id} 
                  className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900"
                >
                  {formatValue(company[metric.field], metric)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};