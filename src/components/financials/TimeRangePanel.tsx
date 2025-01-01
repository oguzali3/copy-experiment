import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
  timePeriods
}: TimeRangePanelProps) => {
  const maxSteps = timePeriods.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">Start Date</p>
          <p className="text-sm font-semibold">{startDate}</p>
        </div>
        <div className="space-y-1.5 text-right">
          <p className="text-sm font-medium text-muted-foreground">End Date</p>
          <p className="text-sm font-semibold">{endDate}</p>
        </div>
      </div>

      <div className="relative pt-6 pb-8">
        <Slider
          min={0}
          max={maxSteps}
          step={1}
          value={sliderValue}
          onValueChange={onSliderChange}
          className="[&_.relative]:cursor-grab [&_.relative:active]:cursor-grabbing"
        />

        {/* Period markers and labels */}
        <div className="absolute left-0 right-0 top-0 -mt-1">
          {timePeriods.map((period, index) => (
            <div
              key={index}
              className="absolute -translate-x-1/2"
              style={{ left: `${(index / maxSteps) * 100}%` }}
            >
              <div 
                className={cn(
                  "w-1.5 h-1.5 rounded-full mb-2 transition-colors",
                  index >= sliderValue[0] && index <= sliderValue[1]
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {period}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};