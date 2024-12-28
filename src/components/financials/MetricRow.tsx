import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface MetricRowProps {
  metricId: string;
  label: string;
  values: number[];
  dates: string[];
  isSelected: boolean;
  onToggle: (metricId: string) => void;
  formatValue: (value: number) => string;
}

export const MetricRow = ({
  metricId,
  label,
  values,
  dates,
  isSelected,
  onToggle,
  formatValue
}: MetricRowProps) => {
  return (
    <TableRow>
      <TableCell className="w-[50px] pr-0">
        <Checkbox
          id={`checkbox-${metricId}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(metricId)}
        />
      </TableCell>
      <TableCell className="font-medium bg-gray-50">
        {label}
      </TableCell>
      {values.map((value, index) => (
        <TableCell key={`${dates[index]}-${metricId}`} className="text-right">
          {formatValue(value)}
        </TableCell>
      ))}
    </TableRow>
  );
};