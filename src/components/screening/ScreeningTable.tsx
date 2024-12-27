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

const mockData = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    country: "US",
    exchange: "NasdaqGS",
    industry: "Semiconductors",
    metrics: {
      revenue: "26974",
      grossMargin: "75.86",
      marketCap: "3426885.7",
    },
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    country: "US",
    exchange: "NasdaqGS",
    industry: "Software",
    metrics: {
      revenue: "254190",
      grossMargin: "69.35",
      marketCap: "3257295.62",
    },
  },
];

interface ScreeningTableProps {
  metrics: ScreeningMetric[];
}

export const ScreeningTable = ({ metrics }: ScreeningTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Exchange</TableHead>
            <TableHead>Industry</TableHead>
            {metrics.map((metric) => (
              <TableHead key={metric.id}>{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((row) => (
            <TableRow key={row.ticker}>
              <TableCell className="font-medium">{row.ticker}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.country}</TableCell>
              <TableCell>{row.exchange}</TableCell>
              <TableCell>{row.industry}</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric.id}>
                  {row.metrics[metric.id as keyof typeof row.metrics]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};