import React from "react";
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

interface ScreeningTableProps {
  metrics: ScreeningMetric[];
  data: any[];
}

export const ScreeningTable = ({ metrics, data }: ScreeningTableProps) => {
  const navigate = useNavigate();

  const handleTickerClick = (ticker: string) => {
    navigate(`/analysis?ticker=${ticker}`);
  };

  const formatValue = (value: any, metricId: string) => {
    if (value === undefined || value === null) return 'N/A';
    
    if (metricId.toLowerCase().includes('margin') || 
        metricId.toLowerCase().includes('growth') ||
        metricId.toLowerCase().includes('ratio')) {
      return `${Number(value).toFixed(2)}%`;
    }
    
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    
    return value;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Industry</TableHead>
            {metrics.map((metric) => (
              <TableHead key={metric.id}>{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((company) => (
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
              <TableCell>{company.country}</TableCell>
              <TableCell>{company.sector}</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric.id}>
                  {formatValue(company[metric.id], metric.id)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};