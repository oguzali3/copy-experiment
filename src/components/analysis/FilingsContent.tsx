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

  // Filter filings by year, including Q4 filings from the previous year
  const filings = allFilings?.filter(filing => {
    if (!selectedYear) return true;
    
    const filingDate = new Date(filing.fillingDate);
    const filingYear = filingDate.getFullYear().toString();
    
    // For Q4 filings, they're typically filed in the following year
    // So if we're looking at 2021, we should include Q4 filings from early 2022
    if (filingYear === selectedYear) {
      return true; // Include all filings from the selected year
    } else if (filingYear === (parseInt(selectedYear) + 1).toString()) {
      // Include Q4 filings that were filed in early next year (typically within first 2-3 months)
      const filingMonth = filingDate.getMonth(); // 0-based, so 0-2 means Jan-Mar
      return filingMonth <= 2; // Include filings from Jan-Mar of the following year
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