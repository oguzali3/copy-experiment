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
import { financialData } from "@/data/financialData";

interface ScreeningTableProps {
  metrics: ScreeningMetric[];
}

export const ScreeningTable = ({ metrics }: ScreeningTableProps) => {
  // Get companies that match the screening criteria
  const getFilteredCompanies = () => {
    const companies = Object.entries(financialData).map(([ticker, data]) => {
      const latestAnnualData = data.annual[0]; // Get most recent year's data
      return {
        ticker,
        name: getCompanyName(ticker),
        metrics: metrics.reduce((acc: Record<string, string>, metric) => {
          acc[metric.id] = latestAnnualData[metric.id as keyof typeof latestAnnualData] || '0';
          return acc;
        }, {})
      };
    });

    // Filter companies based on metric criteria
    return companies.filter(company => {
      return metrics.every(metric => {
        const value = parseFloat(company.metrics[metric.id].replace(/,/g, ''));
        const min = metric.min ? parseFloat(metric.min) : -Infinity;
        const max = metric.max ? parseFloat(metric.max) : Infinity;
        return value >= min && value <= max;
      });
    });
  };

  // Helper function to get company name
  const getCompanyName = (ticker: string): string => {
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'META': 'Meta Platforms, Inc.'
    };
    return companyNames[ticker] || ticker;
  };

  const filteredCompanies = getFilteredCompanies();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Company</TableHead>
            {metrics.map((metric) => (
              <TableHead key={metric.id}>{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCompanies.map((company) => (
            <TableRow key={company.ticker}>
              <TableCell className="font-medium">{company.ticker}</TableCell>
              <TableCell>{company.name}</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric.id}>
                  {metric.id.toLowerCase().includes('margin') || metric.id.toLowerCase().includes('growth')
                    ? `${company.metrics[metric.id]}%`
                    : `$${company.metrics[metric.id]}`
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