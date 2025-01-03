import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearQuarterSelectorProps {
  years: number[];
  quarters: number[];
  selectedYear: string;
  selectedQuarter: string;
  onYearChange: (year: string) => void;
  onQuarterChange: (quarter: string) => void;
}

export const YearQuarterSelector = ({
  years,
  quarters,
  selectedYear,
  selectedQuarter,
  onYearChange,
  onQuarterChange
}: YearQuarterSelectorProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Year
        </label>
        <Select
          value={selectedYear}
          onValueChange={(value) => onYearChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent 
            sideOffset={4}
            align="start" 
            position="item-aligned"
            className="max-h-[300px] overflow-y-auto"
          >
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quarter
        </label>
        <Select
          value={selectedQuarter}
          onValueChange={onQuarterChange}
          disabled={!selectedYear}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select quarter" />
          </SelectTrigger>
          <SelectContent 
            sideOffset={4}
            align="start"
            position="item-aligned"
          >
            {quarters.map((quarter) => (
              <SelectItem key={quarter} value={quarter.toString()}>
                Q{quarter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};