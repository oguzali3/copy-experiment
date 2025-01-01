import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{startDate}</span>
        <span>{endDate}</span>
      </div>
      <div className="px-8 py-8">
        <div className="relative" style={{ margin: '0 24px' }}>
          <Slider
            min={0}
            max={timePeriods.length - 1}
            step={1}
            value={sliderValue}
            onValueChange={onSliderChange}
            className="w-full"
          />
          <div className="absolute w-full top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 20 }}>
            {timePeriods.map((_, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full"
                style={{
                  left: `${(index / (timePeriods.length - 1)) * 100}%`,
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
                  left: `${(index / (timePeriods.length - 1)) * 100}%`,
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