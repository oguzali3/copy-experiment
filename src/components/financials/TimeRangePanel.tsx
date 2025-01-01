import React from "react";
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

  const handleDotClick = (index: number) => {
    // Determine which thumb to move based on which is closer
    const [start, end] = sliderValue;
    if (Math.abs(index - start) <= Math.abs(index - end)) {
      onSliderChange([index, end]);
    } else {
      onSliderChange([start, index]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{startDate}</span>
        <span>{endDate}</span>
      </div>
      <div className="px-2 py-8">
        <div className="relative w-full h-12">
          {/* Track background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2" />
          
          {/* Active track */}
          <div 
            className="absolute top-1/2 h-1 bg-primary rounded-full -translate-y-1/2"
            style={{
              left: `${(sliderValue[0] / maxSteps) * 100}%`,
              right: `${100 - (sliderValue[1] / maxSteps) * 100}%`
            }}
          />

          {/* Period markers and labels */}
          {timePeriods.map((period, index) => (
            <React.Fragment key={index}>
              {/* Marker dot */}
              <button
                onClick={() => handleDotClick(index)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-colors",
                  index >= sliderValue[0] && index <= sliderValue[1]
                    ? "border-primary bg-primary"
                    : "border-gray-300 bg-white"
                )}
                style={{ left: `${(index / maxSteps) * 100}%` }}
              />
              {/* Period label */}
              <div 
                className="absolute text-xs text-gray-500"
                style={{ 
                  left: `${(index / maxSteps) * 100}%`,
                  top: '100%',
                  transform: 'translateX(-50%)'
                }}
              >
                {period}
              </div>
            </React.Fragment>
          ))}

          {/* Range Input */}
          <input
            type="range"
            min={0}
            max={maxSteps}
            step={1}
            value={sliderValue[0]}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              if (newValue <= sliderValue[1]) {
                onSliderChange([newValue, sliderValue[1]]);
              }
            }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
          />
          <input
            type="range"
            min={0}
            max={maxSteps}
            step={1}
            value={sliderValue[1]}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              if (newValue >= sliderValue[0]) {
                onSliderChange([sliderValue[0], newValue]);
              }
            }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
          />
        </div>
      </div>
    </div>
  );
};