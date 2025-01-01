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
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2" />
          
          {/* Active track */}
          <div 
            className="absolute top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2"
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
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full transition-colors",
                  "before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-3 before:h-3 before:rounded-full",
                  index >= sliderValue[0] && index <= sliderValue[1]
                    ? "before:bg-primary"
                    : "before:bg-gray-300"
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

          {/* Left Range Input */}
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
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full appearance-none bg-transparent cursor-pointer z-30
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-7
              [&::-webkit-slider-thumb]:h-7
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-[#545454]
              [&::-webkit-slider-thumb]:border-4
              [&::-webkit-slider-thumb]:border-[#222222]
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:relative
              [&::-webkit-slider-thumb]:z-30
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:transition-transform
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-7
              [&::-moz-range-thumb]:h-7
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#545454]
              [&::-moz-range-thumb]:border-4
              [&::-moz-range-thumb]:border-[#222222]
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:scale-110
              [&::-moz-range-thumb]:transition-transform"
          />
          {/* Right Range Input */}
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
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full appearance-none bg-transparent cursor-pointer z-20
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-7
              [&::-webkit-slider-thumb]:h-7
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-[#545454]
              [&::-webkit-slider-thumb]:border-4
              [&::-webkit-slider-thumb]:border-[#222222]
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:relative
              [&::-webkit-slider-thumb]:z-20
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:transition-transform
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-7
              [&::-moz-range-thumb]:h-7
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#545454]
              [&::-moz-range-thumb]:border-4
              [&::-moz-range-thumb]:border-[#222222]
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:scale-110
              [&::-moz-range-thumb]:transition-transform"
          />
        </div>
      </div>
    </div>
  );
};