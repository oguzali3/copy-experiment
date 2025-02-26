import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TimeRangePanelProps {
  startDate?: string;
  endDate?: string;
  sliderValue?: number[];
  onSliderChange?: (value: number[]) => void;
  timePeriods?: string[];
}

export const TimeRangePanel = ({
  startDate = "",
  endDate = "",
  sliderValue,
  onSliderChange = () => {},
  timePeriods = []
}: TimeRangePanelProps) => {
  // If there are no time periods, render nothing
  if (!timePeriods.length) return null;

  // Set default slider value to show all periods if not provided
  const [actualSliderValue, setActualSliderValue] = useState<number[]>(
    sliderValue || [0, timePeriods.length - 1]
  );

  // Update actual slider value when props change
  useEffect(() => {
    if (sliderValue) {
      setActualSliderValue(sliderValue);
    } else {
      // Default to showing all periods
      setActualSliderValue([0, timePeriods.length - 1]);
    }
  }, [sliderValue, timePeriods.length]);

  // Function to handle local slider changes
  const handleLocalSliderChange = (value: number[]) => {
    setActualSliderValue(value);
    onSliderChange(value);
  };

  // Preset buttons for common time ranges
  const presets = [
    { label: "1Y", handler: () => {
      const endIndex = timePeriods.length - 1;
      const startIndex = Math.max(0, endIndex - 3);
      handleLocalSliderChange([startIndex, endIndex]);
    }},
    { label: "5Y", handler: () => {
      const endIndex = timePeriods.length - 1;
      const startIndex = Math.max(0, endIndex - 9);
      handleLocalSliderChange([startIndex, endIndex]);
    }},
    { label: "10Y", handler: () => {
      const endIndex = timePeriods.length - 1;
      const startIndex = Math.max(0, endIndex - 19);
      handleLocalSliderChange([startIndex, endIndex]);
    }},
    { label: "All", handler: () => {
      handleLocalSliderChange([0, timePeriods.length - 1]);
    }}
  ];

  // Calculate position for each dot in the slider
  const calculatePosition = (index: number) => {
    const total = Math.max(1, timePeriods.length - 1);
    return (index / total) * 100;
  };

  // Get visible time periods based on slider values
  const visiblePeriods = timePeriods.slice(
    Math.min(actualSliderValue[0], actualSliderValue[1]),
    Math.max(actualSliderValue[0], actualSliderValue[1]) + 1
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {visiblePeriods.length > 0 ? (
            <span>
              Showing {visiblePeriods.length} periods: {visiblePeriods[0]} to {visiblePeriods[visiblePeriods.length - 1]}
            </span>
          ) : (
            <span>No periods selected</span>
          )}
        </div>
        <div className="flex space-x-2">
          {presets.map((preset) => (
            <Button 
              key={preset.label}
              variant="outline" 
              size="sm"
              onClick={preset.handler}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="px-2 py-6">
        <div className="relative">
          <Slider
            min={0}
            max={Math.max(0, timePeriods.length - 1)}
            step={1}
            value={actualSliderValue}
            onValueChange={handleLocalSliderChange}
            className="w-full"
          />
          
          {/* Display dots for all time periods */}
          <div className="absolute w-full top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 20 }}>
            {timePeriods.map((_, index) => (
              <div
                key={index}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  index >= actualSliderValue[0] && index <= actualSliderValue[1]
                    ? "bg-primary border border-primary"
                    : "bg-gray-200 border border-gray-300"
                }`}
                style={{
                  left: `${calculatePosition(index)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
          
          {/* Display period labels (selectively to avoid overcrowding) */}
          <div className="absolute w-full -bottom-6 left-0 right-0">
            {timePeriods.map((period, index) => {
              // Only show labels at start, end, and at regular intervals
              const shouldShow = 
                index === 0 || 
                index === timePeriods.length - 1 || 
                index % Math.max(1, Math.floor(timePeriods.length / 10)) === 0;
                
              return shouldShow ? (
                <div
                  key={index}
                  className="absolute text-xs text-gray-500"
                  style={{
                    left: `${calculatePosition(index)}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {period}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};