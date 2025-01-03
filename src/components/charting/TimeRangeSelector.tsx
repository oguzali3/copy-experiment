import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface TimeRangeSelectorProps {
  startYear: number;
  endYear: number;
  selectedRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export const TimeRangeSelector = ({
  startYear,
  endYear,
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) => {
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Time Range</h3>
        <div className="text-sm text-gray-500">
          {selectedRange[0]} - {selectedRange[1]}
        </div>
      </div>
      
      <div className="px-2 py-4">
        <div className="relative">
          <Slider
            min={startYear}
            max={endYear}
            step={1}
            value={selectedRange}
            onValueChange={(value) => onRangeChange(value as [number, number])}
            className="w-full"
          />
          <div className="absolute w-full -bottom-6 left-0 right-0">
            {years.map((year) => (
              <div
                key={year}
                className="absolute text-xs text-gray-500"
                style={{
                  left: `${((year - startYear) / (years.length - 1)) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {year}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};