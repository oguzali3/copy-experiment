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
  const [currentPage, setCurrentPage] = useState(0);

  const { data: filings, isLoading, error } = useFilings(ticker, selectedType, currentPage, selectedYear);

  // Reset page when year or type changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(0);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(0);
  };

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
          onTypeChange={handleTypeChange}
          onYearChange={handleYearChange}
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
          <FilingsTable
            filings={filings}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            No filings found for the selected criteria
          </div>
        )}
      </Card>
    </div>
  );
};