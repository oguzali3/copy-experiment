import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { TranscriptDetail } from "./TranscriptDetail";

interface Transcript {
  id: string;
  event: string;
  date: string;
  fullText?: string;
}

const mockTranscripts: Transcript[] = [
  {
    id: "1",
    event: "Apple Inc., Q4 2024 Earnings Call, Oct 31, 2024",
    date: "31 Ekim 2024",
    fullText: `Good afternoon, and welcome to the Apple Q4 Fiscal Year 2024 Earnings Conference Call. My name is Suhasini Chandramouli, Director of Investor Relations. Today's call is being recorded. Speaking first today are Apple's CEO, Tim Cook; and CFO, Luca Maestri; and they'll be joined by Kevan Parekh, Vice President of Financial Planning and Analysis. After that, we'll open the call to questions from analysts.

Please note that some of the information you'll hear during our discussion today will consist of forward-looking statements, including, without limitation, those regarding revenue, gross margin, operating expenses, other income and expense, taxes, capital allocation, and future business outlook, including the potential impact of macroeconomic conditions on the company's business and results of operations. These statements involve risks and uncertainties that may cause actual results or trends to differ materially from our forecast. For more information, please refer to the risk factors discussed in Apple's most recently filed annual report on Form 10-K and the Form 8-K filed with the SEC today, along with the associated press release. Apple assumes no obligation to update any forward-looking statements, which speak only as of the date they are made.

Additionally, today's discussion will refer to certain non-GAAP financial measures. You can find a reconciliation of these measures in our fourth quarter and full year 2024 earnings release, which is available on our Investor Relations website.

I'd now like to turn the call over to Tim for introductory remarks.`
  },
  {
    id: "2",
    event: "Apple Inc., Q3 2024 Earnings Call, Aug 01, 2024",
    date: "1 Ağustos 2024"
  },
  {
    id: "3",
    event: "Apple Inc., Q2 2024 Earnings Call, May 02, 2024",
    date: "2 Mayıs 2024"
  },
  {
    id: "4",
    event: "Apple Inc., Q1 2024 Earnings Call, Feb 01, 2024",
    date: "1 Şubat 2024"
  },
  {
    id: "5",
    event: "Apple Inc., Q4 2023 Earnings Call, Nov 02, 2023",
    date: "2 Kasım 2023"
  },
  {
    id: "6",
    event: "Apple Inc. Presents at Climate Week, Sep-19-2023 11:00 AM",
    date: "19 Eylül 2023"
  },
  {
    id: "7",
    event: "Apple Inc., Q3 2023 Earnings Call, Aug 03, 2023",
    date: "3 Ağustos 2023"
  },
  {
    id: "8",
    event: "Apple Inc., Q2 2023 Earnings Call, May 04, 2023",
    date: "4 Mayıs 2023"
  },
  {
    id: "9",
    event: "Apple Inc., Q1 2023 Earnings Call, Feb 02, 2023",
    date: "2 Şubat 2023"
  },
  {
    id: "10",
    event: "Apple Inc., Q4 2022 Earnings Call, Oct 27, 2022",
    date: "27 Ekim 2022"
  },
  {
    id: "11",
    event: "Apple Inc., Q3 2022 Earnings Call, Jul 28, 2022",
    date: "28 Temmuz 2022"
  },
  {
    id: "12",
    event: "Apple Inc., Q2 2022 Earnings Call, Apr 28, 2022",
    date: "28 Nisan 2022"
  },
  {
    id: "13",
    event: "Apple Inc., Q1 2022 Earnings Call, Jan 27, 2022",
    date: "27 Ocak 2022"
  },
  {
    id: "14",
    event: "Apple Inc., Q4 2021 Earnings Call, Oct 28, 2021",
    date: "28 Ekim 2021"
  },
  {
    id: "15",
    event: "Apple Inc., Q3 2021 Earnings Call, Jul 27, 2021",
    date: "27 Temmuz 2021"
  },
  {
    id: "16",
    event: "Apple Inc., Q2 2021 Earnings Call, Apr 28, 2021",
    date: "28 Nisan 2021"
  },
  {
    id: "17",
    event: "Apple Inc., Q1 2021 Earnings Call, Jan 27, 2021",
    date: "27 Ocak 2021"
  },
  {
    id: "18",
    event: "Apple Inc., Q4 2020 Earnings Call, Oct 29, 2020",
    date: "29 Ekim 2020"
  },
  {
    id: "19",
    event: "Apple Inc., Q3 2020 Earnings Call, Jul 30, 2020",
    date: "30 Temmuz 2020"
  },
  {
    id: "20",
    event: "Apple Inc., Q2 2020 Earnings Call, Apr 30, 2020",
    date: "30 Nisan 2020"
  },
  {
    id: "21",
    event: "Apple Inc., Q1 2020 Earnings Call, Jan 28, 2020",
    date: "28 Ocak 2020"
  },
  {
    id: "22",
    event: "Apple Inc., Q4 2019 Earnings Call, Oct 30, 2019",
    date: "30 Ekim 2019"
  },
  {
    id: "23",
    event: "Apple Inc., Q3 2019 Earnings Call, Jul 30, 2019",
    date: "30 Temmuz 2019"
  },
  {
    id: "24",
    event: "Apple Inc., Q2 2019 Earnings Call, Apr 30, 2019",
    date: "30 Nisan 2019"
  },
  {
    id: "25",
    event: "Apple Inc., Q1 2019 Earnings Call, Jan 29, 2019",
    date: "29 Ocak 2019"
  }
];

export const TranscriptsContent = () => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const itemsPerPage = 10;

  const sortedTranscripts = [...mockTranscripts].sort((a, b) => {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70%]">Event</TableHead>
            <TableHead className="w-[30%] cursor-pointer" onClick={toggleSort}>
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
          {currentTranscripts.map((transcript) => (
            <TableRow 
              key={transcript.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedTranscript(transcript)}
            >
              <TableCell className="font-medium">{transcript.event}</TableCell>
              <TableCell>{transcript.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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