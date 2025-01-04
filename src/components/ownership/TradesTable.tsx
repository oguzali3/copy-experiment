import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInsiderTrades } from "@/hooks/useOwnershipData";

interface TradesTableProps {
  ticker?: string;
}

export const TradesTable = ({ ticker = "AAPL" }: TradesTableProps) => {
  const { data: trades, isLoading, error } = useInsiderTrades(ticker);

  if (isLoading) {
    return <div>Loading trades data...</div>;
  }

  if (error) {
    return <div>Error loading trades data</div>;
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Insider</TableHead>
            <TableHead className="w-[20%]">Title</TableHead>
            <TableHead className="w-[15%]">Transaction Type</TableHead>
            <TableHead className="w-[15%] text-right">Shares Owned</TableHead>
            <TableHead className="w-[15%] text-right">Shares Traded</TableHead>
            <TableHead className="w-[15%] text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades?.map((trade, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{trade.reportingName}</TableCell>
              <TableCell>{trade.typeOfOwner}</TableCell>
              <TableCell>{trade.transactionType}</TableCell>
              <TableCell className="text-right">{trade.securitiesOwned.toLocaleString()}</TableCell>
              <TableCell className="text-right">{trade.securitiesTransacted.toLocaleString()}</TableCell>
              <TableCell className="text-right">${trade.price.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};