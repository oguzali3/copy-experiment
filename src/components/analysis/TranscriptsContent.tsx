import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { YearQuarterSelector } from "./YearQuarterSelector";
import { TranscriptViewer } from "./TranscriptViewer";
import { useTranscriptDates } from "@/hooks/useTranscriptDates";
import { useTranscript } from "@/hooks/useTranscript";

interface TranscriptsContentProps {
  ticker?: string;
}

export const TranscriptsContent = ({ ticker = "AAPL" }: TranscriptsContentProps) => {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const { getYears, getQuarters, isLoading: isLoadingDates } = useTranscriptDates(ticker);
  const { transcript, isLoading: isLoadingTranscript } = useTranscript(
    ticker,
    selectedYear,
    selectedQuarter
  );

  if (isLoadingDates) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const years = getYears();
  const quarters = getQuarters(selectedYear);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setSelectedQuarter("");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <YearQuarterSelector
          years={years}
          quarters={quarters}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          onYearChange={handleYearChange}
          onQuarterChange={setSelectedQuarter}
        />

        <TranscriptViewer
          transcript={transcript}
          isLoading={isLoadingTranscript}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
        />
      </Card>
    </div>
  );
};