import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useFilings } from "@/hooks/useFilings";
import { FilingsTable } from "./FilingsTable";
import { FilingsDatePicker } from "./FilingsDatePicker";

interface FilingsContentProps {
  ticker?: string;
}

export const FilingsContent = ({ ticker = "AAPL" }: FilingsContentProps) => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { filings, isLoading } = useFilings(ticker, fromDate, toDate);

  if (!fromDate || !toDate) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <FilingsDatePicker
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
          />
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <FilingsDatePicker
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
        <FilingsTable filings={filings || []} />
      </Card>
    </div>
  );
};