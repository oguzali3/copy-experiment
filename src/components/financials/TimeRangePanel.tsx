import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

export interface TimeRangePanelProps {
  timeRange: string;
  onTimeRangeChange: Dispatch<SetStateAction<string>>;
}

export const TimeRangePanel = ({ timeRange, onTimeRangeChange }: TimeRangePanelProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={timeRange === "annual" ? "default" : "outline"}
        onClick={() => onTimeRangeChange("annual")}
      >
        Annual
      </Button>
      <Button
        variant={timeRange === "quarterly" ? "default" : "outline"}
        onClick={() => onTimeRangeChange("quarterly")}
      >
        Quarterly
      </Button>
    </div>
  );
};