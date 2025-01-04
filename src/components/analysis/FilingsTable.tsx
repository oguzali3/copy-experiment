import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Filing } from "@/types/filing";

interface FilingsTableProps {
  filings: Filing[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const FilingsTable = ({ filings, currentPage, onPageChange }: FilingsTableProps) => {
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

      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={filings.length === 0}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};