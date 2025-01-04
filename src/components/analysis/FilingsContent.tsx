import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useFilings } from "@/hooks/useFilings";
import { FilingsSelector } from "./FilingsSelector";
import { FilingsTable } from "./FilingsTable";

interface FilingsContentProps {
  ticker?: string;
}

export const FilingsContent = ({ ticker = "AAPL" }: FilingsContentProps) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const { data: allFilings, isLoading, error } = useFilings(ticker, selectedType);

  // Filter filings by year
  const filings = allFilings?.filter(filing => {
    if (!selectedYear) return true;
    const filingYear = new Date(filing.fillingDate).getFullYear().toString();
    return filingYear === selectedYear;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        Error loading filings: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <FilingsSelector
          selectedType={selectedType}
          selectedYear={selectedYear}
          onTypeChange={setSelectedType}
          onYearChange={setSelectedYear}
        />

        {!selectedType || !selectedYear ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Please select both a filing type and year to view filings
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filings && filings.length > 0 ? (
          <FilingsTable filings={filings} />
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            No filings found for the selected criteria
          </div>
        )}
      </Card>
    </div>
  );
};