import React from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";

interface ScreenerResultsProps {
  metrics: ScreeningMetric[];
}

export const ScreenerResults = ({ metrics }: ScreenerResultsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90">
          Run Screener
        </Button>
        <div className="text-sm text-gray-500">
          Screener Results: 7
        </div>
      </div>
      <ScreeningTable metrics={metrics} />
    </div>
  );
};