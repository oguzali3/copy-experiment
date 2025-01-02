import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseNumber, calculateGrowth } from './BalanceSheetUtils';

interface FinancialDataTableProps {
  data: any[];
  metrics: Array<{
    id: string;
    label: string;
    type?: string;
    calculation?: (current: any, previous: any) => number;
    format?: string;
  }>;
  timePeriods: string[];
}

export const FinancialDataTable = ({ data, metrics, timePeriods }: FinancialDataTableProps) => {
  const formatValue = (value: number | string, format?: string) => {
    if (format === "percentage") {
      return `${Number(value).toFixed(2)}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(Number(value));
  };

  const getValue = (metric: any, periodData: any, previousPeriodData: any) => {
    if (metric.type === "calculated" && metric.calculation) {
      return metric.calculation(periodData, previousPeriodData);
    }
    return parseNumber(periodData[metric.id]);
  };

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] bg-white sticky left-0 z-10">Metric</TableHead>
            {timePeriods.map((period) => (
              <TableHead key={period} className="text-right min-w-[120px]">{period}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id}>
              <TableCell className="font-medium bg-white sticky left-0">{metric.label}</TableCell>
              {timePeriods.map((period, index) => {
                const periodData = data.find(d => d.period === period);
                const previousPeriodData = index < timePeriods.length - 1 
                  ? data.find(d => d.period === timePeriods[index + 1])
                  : null;
                
                if (!periodData) return <TableCell key={period} className="text-right">-</TableCell>;
                
                const value = getValue(metric, periodData, previousPeriodData);
                return (
                  <TableCell key={period} className="text-right">
                    {formatValue(value, metric.format)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};