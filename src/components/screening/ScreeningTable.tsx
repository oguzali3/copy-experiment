import React from "react";
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

const formatValue = (value: any, metricId: string): string => {
  if (value === null || value === undefined) return 'N/A';

  // Format based on metric type
  if (metricId.includes('margin') || metricId.includes('growth') || 
      metricId.includes('ratio') || metricId.includes('yield') || 
      metricId.includes('roe') || metricId.includes('roa')) {
    return `${Number(value).toFixed(2)}%`;
  }

  if (metricId === 'market_cap') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  return value.toString();
};

export const ScreeningTable = ({ metrics, data }: ScreeningTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
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
              <TableCell className="font-medium">{company.symbol}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.country}</TableCell>
              <TableCell>{company.industry}</TableCell>
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