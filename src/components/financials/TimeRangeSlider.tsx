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
    <div className="px-2 py-8">
      <div className="relative">
        <div className="absolute w-full top-[9px]">
          {timePeriods.map((_, index) => (
            <div
              key={index}
              className="absolute w-1.5 h-1.5 bg-white border border-primary rounded-full"
              style={{
                left: `${(index / 4) * 100}%`,
                transform: 'translate(-50%, 0)',
              }}
            />
          ))}
        </div>
        <Slider
          defaultValue={[0, 4]}
          min={0}
          max={4}
          step={1}
          value={sliderValue}
          onValueChange={onSliderChange}
          className="w-full"
        />
        <div className="absolute w-full -bottom-5 left-0 right-0">
          {timePeriods.map((period, index) => (
            <div 
              key={index} 
              className="absolute text-xs text-gray-500"
              style={{ 
                left: `${(index / 4) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {period}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};