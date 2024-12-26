import { Button } from "@/components/ui/button";
import { RefreshCcw, RotateCcw } from "lucide-react";
import { MetricsSearch } from "../MetricsSearch";
import { TimeRangeSlider } from "./TimeRangeSlider";

interface TimeRangePanelProps {
  startDate: string;
  endDate: string;
  sliderValue: number[];
  onSliderChange: (value: number[]) => void;
  timePeriods: string[];
}

export const TimeRangePanel = ({
  startDate,
  endDate,
  sliderValue,
  onSliderChange,
  timePeriods,
}: TimeRangePanelProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
          {startDate}
          <button className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
          {endDate}
          <button className="text-gray-400 hover:text-gray-600">×</button>
        </div>
      </div>

      <TimeRangeSlider
        sliderValue={sliderValue}
        onSliderChange={onSliderChange}
        timePeriods={timePeriods}
      />

      <div className="flex items-center gap-4">
        <MetricsSearch />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};