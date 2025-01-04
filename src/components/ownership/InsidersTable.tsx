import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInsiderRoster } from "@/hooks/useOwnershipData";

interface InsidersTableProps {
  ticker?: string;
}

export const InsidersTable = ({ ticker = "AAPL" }: InsidersTableProps) => {
  const { data: insiders, isLoading, error } = useInsiderRoster(ticker);

  if (isLoading) {
    return <div>Loading insider data...</div>;
  }

  if (error) {
    return <div>Error loading insider data</div>;
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Insider</TableHead>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead className="w-[20%]">Last Transaction Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insiders?.map((insider, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{insider.owner}</TableCell>
              <TableCell>{insider.typeOfOwner}</TableCell>
              <TableCell>{new Date(insider.transactionDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};