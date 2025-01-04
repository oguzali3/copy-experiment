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

  // Filter filings by year, including Q4 filings from both previous and next year
  const filings = allFilings?.filter(filing => {
    if (!selectedYear) return true;
    
    const filingDate = new Date(filing.fillingDate);
    const filingYear = filingDate.getFullYear().toString();
    const filingMonth = filingDate.getMonth(); // 0-based, so 0-2 means Jan-Mar
    const selectedYearNum = parseInt(selectedYear);
    
    // Case 1: Filing is from the selected year
    if (filingYear === selectedYear) {
      return true;
    }
    
    // Case 2: Q4 filing from previous year that belongs to selected year
    // If it's from previous year and filed in Q1 (Jan-Mar), it likely belongs to selected year
    if (filingYear === (selectedYearNum - 1).toString() && filingMonth >= 9) {
      return true;
    }
    
    // Case 3: Q4 filing from selected year that's filed in next year's Q1
    if (filingYear === (selectedYearNum + 1).toString() && filingMonth <= 2) {
      return true;
    }
    
    return false;
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