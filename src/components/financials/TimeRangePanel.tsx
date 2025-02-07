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
  sliderValue = [0],
  onSliderChange = () => {},
  timePeriods = []
}: TimeRangePanelProps) => {
  // If there are no time periods, render nothing
  if (!timePeriods.length) return null;

  // Calculate the offset percentage for better alignment
  const offsetPercentage = 0.7; // Adjust this value as needed
  
  // Function to calculate adjusted position
  const calculatePosition = (index: number, total: number) => {
    if (index === 0) return offsetPercentage; // First dot
    if (index === total - 1) return 100 - offsetPercentage; // Last dot
    // For middle dots, distribute evenly between offset points
    return offsetPercentage + ((100 - 2 * offsetPercentage) * index / (total - 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{startDate}</span>
        <span>{endDate}</span>
      </div>
      <div className="px-2 py-8">
        <div className="relative">
          <Slider
            min={0}
            max={Math.max(0, timePeriods.length - 1)}
            step={1}
            value={sliderValue}
            onValueChange={onSliderChange}
            className="w-full"
          />
          <div className="absolute w-full top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 20 }}>
            {timePeriods.map((_, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-white border border-primary rounded-full"
                style={{
                  left: `${calculatePosition(index, timePeriods.length)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
          <div className="absolute w-full -bottom-5 left-0 right-0">
            {timePeriods.map((period, index) => (
              <div
                key={index}
                className="absolute text-xs text-gray-500"
                style={{
                  left: `${calculatePosition(index, timePeriods.length)}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {period}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeRangePanel;