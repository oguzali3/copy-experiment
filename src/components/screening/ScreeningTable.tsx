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

export const ScreeningTable = ({ metrics, results }: ScreeningTableProps) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Get the available metrics based on the actual data in results
  const availableMetrics = useMemo(() => {
    if (results.length === 0) return [];
    
    // Get all fields that have values in the results
    const firstResult = results[0];
    const availableFields = new Set(Object.keys(firstResult));
    
    // Filter metrics to only include those that have data
    return metrics.filter(metric => 
      availableFields.has(metric.field.toLowerCase()) || 
      availableFields.has(metric.id.toLowerCase())
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

  const formatValue = (value: any, metric: ScreeningMetric) => {
    if (value === undefined || value === null) return '-';
    
    if (metric.field.toLowerCase().includes('margin') || 
        metric.field.toLowerCase().includes('growth') ||
        metric.field.toLowerCase().includes('ratio')) {
      return `${Number(value).toFixed(2)}%`;
    }
    
    // Format large numbers
    if (typeof value === 'number' && Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    
    return `$${Number(value).toLocaleString()}`;
  };

  const sortedResults = getSortedResults();

  if (results.length === 0) {
    return <div className="text-center py-4 text-gray-500">No results found</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center">
                Ticker
                {getSortIcon('symbol')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('companyName')}
            >
              <div className="flex items-center">
                Company
                {getSortIcon('companyName')}
              </div>
            </TableHead>
            {availableMetrics.map((metric) => (
              <TableHead 
                key={metric.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort(metric.field.toLowerCase())}
              >
                <div className="flex items-center">
                  {metric.name}
                  {getSortIcon(metric.field.toLowerCase())}
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
              <TableCell>{company.companyName || '-'}</TableCell>
              {availableMetrics.map((metric) => (
                <TableCell key={metric.id}>
                  {formatValue(company[metric.field.toLowerCase()], metric)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};