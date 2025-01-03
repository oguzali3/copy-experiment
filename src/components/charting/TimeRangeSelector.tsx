import { Slider } from "@/components/ui/slider";

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
    <div className="w-full space-y-4 p-4 bg-white rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Time Range</h3>
        <span className="text-gray-500">
          {selectedRange[0]} - {selectedRange[1]}
        </span>
      </div>
      <div className="px-2 py-4">
        <Slider
          min={startYear}
          max={endYear}
          step={1}
          value={[selectedRange[0], selectedRange[1]]}
          onValueChange={(value) => onRangeChange(value as [number, number])}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          {years.map((year) => (
            <span key={year} className="text-sm text-gray-500">
              {year}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};