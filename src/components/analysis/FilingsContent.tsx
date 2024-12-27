import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { filingData } from "@/data/filingData";
import { Filing } from "@/types/filing";

interface FilingsContentProps {
  ticker?: string;
}

export const FilingsContent = ({ ticker = "AAPL" }: FilingsContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  const filings = filingData[ticker] || [];
  
  // Filter filings based on search query
  const filteredFilings = filings.filter((filing) => {
    const searchString = `${filing.type} ${filing.title} ${filing.description}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Sort filings by date
  const sortedFilings = [...filteredFilings].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFilings = sortedFilings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedFilings.length / itemsPerPage);

  const handleFilingClick = (filing: Filing) => {
    window.open(filing.url, '_blank');
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search filings..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
          className="pl-10"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Form</TableHead>
            <TableHead className="w-[15%]">Type</TableHead>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead 
              className="w-[30%] cursor-pointer hover:text-blue-600 transition-colors"
              onClick={toggleSort}
            >
              <div className="flex items-center gap-2">
                Date
                {sortDirection === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentFilings.map((filing) => (
            <TableRow 
              key={filing.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleFilingClick(filing)}
            >
              <TableCell className="font-medium">{filing.form}</TableCell>
              <TableCell>{filing.type}</TableCell>
              <TableCell>{filing.description}</TableCell>
              <TableCell>{filing.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};