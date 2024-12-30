import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface IncomeStatementMetricsProps {
  metricId: string;
  label: string;
  values: number[];
  isSelected: boolean;
  onToggle: (metricId: string) => void;
  formatValue: (value: number, isPercentage?: boolean) => string;
  isGrowthMetric?: boolean;
}

export const IncomeStatementMetrics = ({
  metricId,
  label,
  values,
  isSelected,
  onToggle,
  formatValue,
  isGrowthMetric = false
}: IncomeStatementMetricsProps) => {
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
        <TableCell 
          key={index} 
          className={`text-right ${
            isGrowthMetric && value !== 0
              ? value > 0 
                ? 'text-green-600' 
                : 'text-red-600'
              : ''
          }`}
        >
          {formatValue(value, isGrowthMetric)}
        </TableCell>
      ))}
    </TableRow>
  );
};