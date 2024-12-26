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
          defaultValue={[0, 11]}
          min={0}
          max={11}
          step={1}
          value={sliderValue}
          onValueChange={onSliderChange}
          className="w-full mb-6"
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {timePeriods.map((period, index) => (
            <span key={index} className="transform -rotate-45 origin-top-left">
              {period}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};