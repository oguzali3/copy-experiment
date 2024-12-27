import { useState } from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { TranscriptDetail } from "./TranscriptDetail";
import { TranscriptTable } from "./TranscriptTable";
import { transcriptData } from "@/data/transcriptData";
import { Transcript } from "@/types/transcript";

interface TranscriptsContentProps {
  ticker?: string;
}

export const TranscriptsContent = ({ ticker = "AAPL" }: TranscriptsContentProps) => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const itemsPerPage = 10;

  const transcripts = transcriptData[ticker] || [];
  
  const sortedTranscripts = [...transcripts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTranscripts = sortedTranscripts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedTranscripts.length / itemsPerPage);

  const toggleSort = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  if (selectedTranscript) {
    return (
      <TranscriptDetail 
        transcript={selectedTranscript} 
        onBack={() => setSelectedTranscript(null)} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <TranscriptTable 
        transcripts={currentTranscripts}
        sortDirection={sortDirection}
        onSort={toggleSort}
        onTranscriptClick={setSelectedTranscript}
      />

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
    </div>
  );
};