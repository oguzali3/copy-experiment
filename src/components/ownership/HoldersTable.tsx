import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInstitutionalHolders } from "@/hooks/useOwnershipData";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface HoldersTableProps {
  ticker?: string;
}

export const HoldersTable = ({ ticker = "AAPL" }: HoldersTableProps) => {
  const { data: holders, isLoading, error } = useInstitutionalHolders(ticker);

  if (isLoading) {
    return <div>Loading institutional holders data...</div>;
  }

  if (error) {
    return <div>Error loading institutional holders data</div>;
  }

  // Sort by ownership percentage and take top 10
  const topHolders = holders
    ?.sort((a, b) => b.ownership - a.ownership)
    .slice(0, 10);

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Institution</TableHead>
            <TableHead className="w-[15%] text-right">Shares</TableHead>
            <TableHead className="w-[15%] text-right">% Owned</TableHead>
            <TableHead className="w-[15%] text-right">Market Value</TableHead>
            <TableHead className="w-[15%] text-right">Change in Shares</TableHead>
            <TableHead className="w-[15%] text-right">% Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topHolders?.map((holder, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{holder.investorName}</TableCell>
              <TableCell className="text-right">{holder.sharesNumber.toLocaleString()}</TableCell>
              <TableCell className="text-right">{holder.ownership.toFixed(2)}%</TableCell>
              <TableCell className="text-right">${(holder.marketValue / 1000000).toFixed(2)}M</TableCell>
              <TableCell className="text-right">{holder.changeInSharesNumber.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div className={`flex items-center justify-end ${holder.changeInSharesNumberPercentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holder.changeInSharesNumberPercentage > 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(holder.changeInSharesNumberPercentage).toFixed(2)}%
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};