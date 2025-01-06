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
  results: any[];
}

export const ScreeningTable = ({ metrics, results }: ScreeningTableProps) => {
  const navigate = useNavigate();

  const handleTickerClick = (ticker: string) => {
    navigate(`/analysis?ticker=${ticker}`);
  };

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
          {results.map((company) => (
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