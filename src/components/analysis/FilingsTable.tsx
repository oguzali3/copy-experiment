import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Filing } from "@/hooks/useFilings";

interface FilingsTableProps {
  filings: Filing[];
}

export const FilingsTable = ({ filings }: FilingsTableProps) => {
  const handleFilingClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Form Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>CIK</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filings.map((filing, index) => (
          <TableRow
            key={index}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => handleFilingClick(filing.link)}
          >
            <TableCell className="font-medium">{filing.form_type}</TableCell>
            <TableCell>{filing.title}</TableCell>
            <TableCell>{format(new Date(filing.date), "PPP")}</TableCell>
            <TableCell>{filing.cik}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};