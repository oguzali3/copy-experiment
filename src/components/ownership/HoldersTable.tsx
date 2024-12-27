import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface HoldersTableProps {
  ticker?: string;
}

// Mock data - in a real app, this would come from an API
const holdersData = {
  AAPL: [
    {
      name: "The Vanguard Group, Inc.",
      date: "2024-09-30",
      percentOwned: "9.06053",
      marketValue: "$289.87B",
      shares: "673.64M",
      changeShares: "-2.27M",
      changeSharesPercent: -0.34,
      percentPortfolio: "4.24"
    },
    {
      name: "BlackRock Inc.",
      date: "2024-09-30",
      percentOwned: "7.5522",
      marketValue: "$241.61B",
      shares: "561.48M",
      changeShares: "7.51M",
      changeSharesPercent: 1.35,
      percentPortfolio: "3.85"
    },
    // Add more mock data as needed
  ],
  MSFT: [
    // Add Microsoft mock data
  ]
};

export const HoldersTable = ({ ticker = "AAPL" }: HoldersTableProps) => {
  const holders = holdersData[ticker as keyof typeof holdersData] || [];

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Investor</TableHead>
            <TableHead className="w-[12%]">Date</TableHead>
            <TableHead className="w-[10%] text-right">% Owned</TableHead>
            <TableHead className="w-[13%] text-right">Market Value</TableHead>
            <TableHead className="w-[10%] text-right">Shares</TableHead>
            <TableHead className="w-[10%] text-right">Chg. Shares</TableHead>
            <TableHead className="w-[10%] text-right">Chg. Shares %</TableHead>
            <TableHead className="w-[10%] text-right">% Portfolio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holders.map((holder, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{holder.name}</TableCell>
              <TableCell>{holder.date}</TableCell>
              <TableCell className="text-right">{holder.percentOwned}%</TableCell>
              <TableCell className="text-right">{holder.marketValue}</TableCell>
              <TableCell className="text-right">{holder.shares}</TableCell>
              <TableCell className="text-right">{holder.changeShares}</TableCell>
              <TableCell className="text-right">
                <div className={`flex items-center justify-end ${holder.changeSharesPercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holder.changeSharesPercent > 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(holder.changeSharesPercent)}%
                </div>
              </TableCell>
              <TableCell className="text-right">{holder.percentPortfolio}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};