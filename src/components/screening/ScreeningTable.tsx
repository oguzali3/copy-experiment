import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScreeningMetric } from "@/types/screening";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ScreeningTableProps {
  metrics: ScreeningMetric[];
  results: any[];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

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

const formatValue = (value: any, metricField: string) => {
  if (value === null || value === undefined) return '-';
  
  const fieldLower = metricField.toLowerCase();
  
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

  // Get all available metrics based on the actual data in results
  const availableMetrics = useMemo(() => {
    if (results.length === 0) return [];
    
    // Get all fields that have values in the results
    const firstResult = results[0];
    const availableFields = new Set(Object.keys(firstResult));
    
    // Filter metrics to only include those that have data
    return metrics.filter(metric => 
      availableFields.has(metric.field) || 
      availableFields.has(metric.id)
    );
  }, [metrics, results]);

  const handleTickerClick = (ticker: string) => {
    navigate(`/analysis?ticker=${ticker}`);
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
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center whitespace-nowrap">
                Ticker
                {getSortIcon('symbol')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('companyName')}
            >
              <div className="flex items-center whitespace-nowrap">
                Company
                {getSortIcon('companyName')}
              </div>
            </TableHead>
            {availableMetrics.map((metric) => (
              <TableHead 
                key={metric.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort(metric.field)}
              >
                <div className="flex items-center whitespace-nowrap">
                  {metric.name}
                  {getSortIcon(metric.field)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((company) => (
            <TableRow key={company.symbol}>
              <TableCell>
                <button
                  onClick={() => handleTickerClick(company.symbol)}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {company.symbol}
                </button>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {company.companyName || '-'}
              </TableCell>
              {availableMetrics.map((metric) => (
                <TableCell key={metric.id} className="text-right">
                  {formatValue(company[metric.field], metric.field)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};