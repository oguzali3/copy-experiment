import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILING_TYPES = [
  { value: "10-K", label: "Annual Report (10-K)" },
  { value: "10-Q", label: "Quarterly Report (10-Q)" },
  { value: "8-K", label: "Current Report (8-K)" },
  { value: "20-F", label: "Foreign Annual Report (20-F)" },
  { value: "6-K", label: "Foreign Current Report (6-K)" },
];

interface FilingsSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export const FilingsSelector = ({
  selectedType,
  onTypeChange,
}: FilingsSelectorProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filing Type
        </label>
        <Select
          value={selectedType}
          onValueChange={onTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select filing type" />
          </SelectTrigger>
          <SelectContent>
            {FILING_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};