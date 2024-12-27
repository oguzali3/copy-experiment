import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Transcript } from "@/types/transcript";

interface TranscriptTableProps {
  transcripts: Transcript[];
  sortDirection: "asc" | "desc";
  onSort: () => void;
  onTranscriptClick: (transcript: Transcript) => void;
}

export const TranscriptTable = ({
  transcripts,
  sortDirection,
  onSort,
  onTranscriptClick
}: TranscriptTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[70%]">Event</TableHead>
          <TableHead className="w-[30%] cursor-pointer" onClick={onSort}>
            <div className="flex items-center gap-2">
              Event Date
              {sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transcripts.map((transcript) => (
          <TableRow 
            key={transcript.id}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => onTranscriptClick(transcript)}
          >
            <TableCell className="font-medium">{transcript.event}</TableCell>
            <TableCell>{transcript.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};