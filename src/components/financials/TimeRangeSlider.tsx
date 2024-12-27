import { Slider } from "@/components/ui/slider";

interface TimeRangeSliderProps {
  sliderValue: number[];
  onSliderChange: (value: number[]) => void;
  timePeriods: string[];
}

export const TimeRangeSlider = ({
  sliderValue,
  onSliderChange,
  timePeriods,
}: TimeRangeSliderProps) => {
  return (
    <div className="px-2 py-4">
      <div className="relative pb-8">
        <Slider
          defaultValue={[0, 4]}
          min={0}
          max={4}
          step={1}
          value={sliderValue}
          onValueChange={onSliderChange}
          className="w-full mb-6"
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {timePeriods.map((period, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center"
              style={{ 
                position: 'absolute', 
                left: `${(index / 4) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="h-2 w-0.5 bg-gray-300 mb-1"></div>
              <span>{period}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};