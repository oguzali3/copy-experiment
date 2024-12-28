import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

interface TimeRangePanelProps {
  timeRange: string;
  onTimeRangeChange: Dispatch<SetStateAction<string>>;
}

export const TimeRangePanel = ({ timeRange, onTimeRangeChange }: TimeRangePanelProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={timeRange === "annual" ? "default" : "outline"}
        onClick={() => onTimeRangeChange("annual")}
        size="sm"
      >
        Annual
      </Button>
      <Button
        variant={timeRange === "quarterly" ? "default" : "outline"}
        onClick={() => onTimeRangeChange("quarterly")}
        size="sm"
      >
        Quarterly
      </Button>
    </div>
  );
};