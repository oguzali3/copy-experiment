import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TimeRangePanelProps {
  startDate?: string;
  endDate?: string;
  sliderValue?: number[];
  onSliderChange?: (value: number[]) => void;
  timePeriods?: string[];
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const TimeRangePanel = ({
  startDate = "",
  endDate = "",
  sliderValue,
  onSliderChange = () => {},
  timePeriods = [],
  timeFrame = "annual"
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

  // Get preset configurations based on timeFrame
  const getPresetButtons = () => {
    if (timeFrame === 'quarterly') {
      // Quarterly presets - 1Y (4 quarters), 2Y (8 quarters), 3Y (12 quarters)
      return [
        { 
          label: "1Y", 
          handler: () => {
            const endIndex = timePeriods.length - 1;
            const startIndex = Math.max(0, endIndex - 3); // 4 quarters = 1 year
            handleLocalSliderChange([startIndex, endIndex]);
          }
        },
        { 
          label: "3Y", 
          handler: () => {
            const endIndex = timePeriods.length - 1;
            const startIndex = Math.max(0, endIndex - 11); // 8 quarters = 2 years
            handleLocalSliderChange([startIndex, endIndex]);
          }
        },
        { 
          label: "5Y", 
          handler: () => {
            const endIndex = timePeriods.length - 1;
            const startIndex = Math.max(0, endIndex - 19); // 12 quarters = 3 years
            handleLocalSliderChange([startIndex, endIndex]);
          }
        },
        { 
          label: "All", 
          handler: () => {
            handleLocalSliderChange([0, timePeriods.length - 1]);
          }
        }
      ];
    } else {
      // Annual/TTM presets
      return [
        { 
          label: "5Y", 
          handler: () => {
            const endIndex = timePeriods.length - 1;
            const startIndex = Math.max(0, endIndex - 4); // 5 years including current year
            handleLocalSliderChange([startIndex, endIndex]);
          }
        },
        { 
          label: "10Y", 
          handler: () => {
            const endIndex = timePeriods.length - 1;
            const startIndex = Math.max(0, endIndex - 9); // 10 years including current year
            handleLocalSliderChange([startIndex, endIndex]);
          }
        },
        { 
          label: "All", 
          handler: () => {
            handleLocalSliderChange([0, timePeriods.length - 1]);
          }
        }
      ];
    }
  };

  const presets = getPresetButtons();

  // Calculate position for each dot in the slider
  const calculatePosition = (index: number) => {
    if (timePeriods.length <= 1) return 50; // Center if only one period
    
    // Add offset to match slider's internal padding
    // Slider handles often don't reach the absolute edges of the track
    const paddingOffset = 0.8; // Percentage offset from edges (adjust as needed)
    
    if (index === 0) {
      return paddingOffset; // First dot position
    } else if (index === timePeriods.length - 1) {
      return 100 - paddingOffset; // Last dot position
    } else {
      // For middle dots, distribute evenly between offset boundaries
      return paddingOffset + ((100 - (2 * paddingOffset)) * index / (timePeriods.length - 1));
    }
  };

  // Get visible time periods based on slider values
  const visiblePeriods = timePeriods.slice(
    Math.min(actualSliderValue[0], actualSliderValue[1]),
    Math.max(actualSliderValue[0], actualSliderValue[1]) + 1
  );

  return (
    <div className="space-y-6 mt-6">
      <div className="px-2 py-4">
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
              // For quarterly data, show fewer labels to avoid overcrowding
              const labelInterval = timeFrame === 'quarterly' ? 
                Math.max(1, Math.floor(timePeriods.length / 6)) : 
                Math.max(1, Math.floor(timePeriods.length / 10));
              
              // Only show labels at start, end, and at regular intervals
              const shouldShow = 
                index === 0 || 
                index === timePeriods.length - 1 || 
                index % labelInterval === 0;
                
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
      
      {/* Increased spacing below slider */}
      <div className="flex justify-between items-center mt-10 pt-4 border-t border-gray-100">
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
    </div>
  );
};