import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filing } from "@/types/filing";

interface FilingsTableProps {
  filings: Filing[];
}

export const FilingsTable = ({ filings }: FilingsTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFilingClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Filing Date</TableHead>
            <TableHead>Accepted Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings.map((filing, index) => (
            <TableRow
              key={index}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleFilingClick(filing.finalLink)}
            >
              <TableCell className="font-medium">{filing.type}</TableCell>
              <TableCell>{formatDate(filing.fillingDate)}</TableCell>
              <TableCell>{formatDate(filing.acceptedDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};