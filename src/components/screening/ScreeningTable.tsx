import React, { useState } from "react";
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
import { cn } from "@/lib/utils";

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

  const sortedResults = getSortedResults();

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
            {metrics.map((metric) => (
              <TableHead 
                key={metric.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort(metric.id)}
              >
                <div className="flex items-center">
                  {metric.name}
                  {getSortIcon(metric.id)}
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
              <TableCell>{company.companyName}</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric.id}>
                  {metric.id.toLowerCase().includes('margin') || metric.id.toLowerCase().includes('growth')
                    ? `${company[metric.id]}%`
                    : `$${company[metric.id]}`
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};